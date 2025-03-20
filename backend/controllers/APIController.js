import axios from "axios";
// import dbConnection from "../config/RemoteDb.js";
import generateUniqueApiKey from "../utils/generatePassword.js";
import ErrorHandler from "../utils/errorHandler.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";
import sendEmail from "../utils/zeptoMail.js";
import basicTemplate from "../EmailTemplates/BasicTemplate.js";
import urls from "../ConstFiles/urls.js";
import Razorpay from "razorpay";
import { updateLeadStatus } from "../utils/crm.js";
import paypalPrice from "../utils/payPalPriceRange.js";
import RazorpayPrice from "../utils/RazorPayPriceRange.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
import PurchaseApi from "../utils/thrive.js";
import InrToUsdConverter from "../utils/INRtoUSD.js";
import InrToUsdSubscriptionConverter from "../utils/INRtoUSDSubscription.js";
import ZohoBooks from "../utils/zohoBooks.js";
import streamifier from 'streamifier';
import FormData from 'form-data'
import Papa from 'papaparse'
import XLSX from 'xlsx'
import fs from 'fs'
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { io, activeUsers } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let APIControllers = {
  getCreditBalance: async (req, res) => {
    let dbConnection
    try {
      dbConnection = req.dbConnection;
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ error: "Unauthorized", message: "Token is required." });
      }

      const tokenWithoutBearer = token.replace("Bearer ", "");
      let parsedTokenWithoutBearer = JSON.parse(tokenWithoutBearer)
      const decoded = jwt.verify(parsedTokenWithoutBearer.token, process.env.JWT_SECRET);
      let user = await dbConnection.query(`SELECT free_final,credits_free,credits,is_team_member,team_id from registration WHERE rowid='${decoded.userId}'`)
      let creditBal;
      if (user[0][0].is_team_member == 1) {
        let TeamAdmin = await dbConnection.query(`SELECT free_final,credits_free,credits from registration WHERE rowid='${user[0][0].team_id}'`)
        let finalFree = new Date(TeamAdmin[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        if (TeamAdmin[0][0].credits_free > 0 && finalFreeDate > currentDate) {
          creditBal = TeamAdmin[0][0].credits_free + TeamAdmin[0][0].credits
        } else {
          creditBal = TeamAdmin[0][0].credits;
        }
      }
      else {
        let finalFree = new Date(user[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        if (user[0][0].credits_free > 0 && finalFreeDate > currentDate) {
          creditBal = user[0][0].credits_free + user[0][0].credits
        } else {
          creditBal = user[0][0].credits;
        }
      }
      res.status(200).json(creditBal)
    } catch (error) {
      console.log(error);
      // ErrorHandler("getApi Controller", error, req);
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: "TokenExpired", message: "Your session has expired. Please log in again." });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    }
    finally {
      if (dbConnection) {
        await dbConnection.release();
      }
    }
  },
  getApi: async (req, res) => {
    try {
      if (req.user?.api_key) {
        res.status(200).json({ apiKey: req.user.api_key });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("getApi Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  resetApiKey: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let newApiKey = await generateUniqueApiKey(req);
      let user = await dbConnection.query(
        `UPDATE registration SET api_key='${newApiKey}' WHERE emailid='${req.user[0][0].emailid}'`
      );
      if (user[0].affectedRows === 1) {
        res.status(200).json({ newApiKey });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("resetApiKey Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  emailValidation: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      if (!req.body.email || typeof req.body.email !== 'string') {
        return res.status(400).json({ error: "Invalid email provided" });
      }

      if (!req.user[0][0] || !req.user[0][0].api_key) {
        return res.status(403).json({ error: "API key not found or user not authenticated" });
      }
      let apiKey
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user[0][0].api_key;
      }
      const response = await axios.get(
        `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${apiKey}&speed_rank=0`
      );
      if (response.data && response.data.gamalogic_emailid_vrfy) {
        res.status(200).json(response.data.gamalogic_emailid_vrfy[0]);
      } else {
        res.status(500).json({ error: "Unexpected response from email validation service" });
      }
    } catch (error) {
      console.log(error)
      ErrorHandler("emailValidation Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  FindSingleEmail: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      let nameArray = req.body.fullname.split(" ");
      let firstname = nameArray[0];
      let lastname = nameArray[nameArray.length - 1];
      let apiKey
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user[0][0].api_key;
      }
      let find = await axios.get(
        `https://gamalogic.com/email-discovery/?firstname=${firstname}&lastname=${lastname}&domain=${req.body.domain}&apikey=${apiKey}&speed_rank=0`
      );
      res.status(200).json(find?.data);
    } catch (error) {
      console.log(error);
      ErrorHandler("FindSingleEmail Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  changePassword: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let { old, newPassword, confirm } = req.body;
      let passwordMatch
      let googleUser
      if (old != 'PasswordForgoogleUsers') {
        const hashedPassword = req.user[0][0].password;
        passwordMatch = await verifyPassword(old, hashedPassword);
        googleUser = 0
      }
      else {
        passwordMatch = true
        googleUser = 1
      }
      if (!passwordMatch) {
        res.status(400).json({ message: "Previous password is invalid" });
      } else {
        let hashedPasswordForDatabase = await passwordHash(newPassword);
        await dbConnection.query(
          `UPDATE registration SET password='${hashedPasswordForDatabase}' WHERE emailid='${req.user[0][0].emailid}'`
        );
        let content = `<p>Your password has been successfully updated.</p>
          
        <p>If you did not initiate this action, please contact us immediately.</p>
        <div class="verify">
        <a href="${urls.frontendUrl}/"><button
        class="verifyButton">Sign In</button></a>

</div>`
        sendEmail(
          req.user[0][0].username,
          req.user[0][0].emailid,
          "Password successfully updated",
          basicTemplate(req.user[0][0].username, content)
        );
        res.status(200).json({ message: "Password successfully changed", googleUser });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("changePassword Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  getAlreadyCheckedBatchEmailFiles: async (req, res) => {
    let dbConnection;
    try {
      dbConnection = req.dbConnection;
      if (req.user[0][0] && req.user[0][0].rowid != null) {
        if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
          let files = await dbConnection.query(
            `SELECT * FROM useractivity_batch_link WHERE team_member_id='${req.user[0][0].rowid}' AND (error_id IS NULL OR error_id = 0) ORDER BY date_time DESC LIMIT 6 OFFSET ${(req.query.page - 1) * 6};`
          );
          console.log('first')
          res.status(200).json(files[0]);
        }
        else {
          let files = await dbConnection.query(
            `SELECT * FROM useractivity_batch_link WHERE userid='${req.user[0][0].rowid}' AND (error_id IS NULL OR error_id = 0) ORDER BY date_time DESC LIMIT 6 OFFSET ${(req.query.page - 1) * 6};`
          );
          console.log('second')

          res.status(200).json(files[0]);
        }
      }
    } catch (error) {
      console.error(error);
      ErrorHandler("getAlreadyCheckedBatchEmailFiles Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
      if (dbConnection) {
        try {
          await dbConnection.release();
        } catch (endError) {
          console.error("Error closing database connection:", endError);
        }
      }
    }
  },

  batchEmailValidation: async (req, res) => {
    try {
      console.time('Total Execution Time');
      const dbConnection = req.dbConnection;

      const results = JSON.parse(req.body.results);
      const columnFields = JSON.parse(req.body.fields);
      const { data, fileName } = results
      let emails = data
      let apiKey
      let batchId
      let response
      let files
      console.time('Team Check & DB Query');
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key,credits,credits_free,free_final FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
        let memberKey = req.user[0][0].api_key
        let finalFreeDate = new Date(admin[0].free_final);
        let currentDate = new Date();
        console.timeEnd('Team Check & DB Query');
        if ((admin[0].credits + admin[0].credits_free >= emails.length && finalFreeDate > currentDate) || (admin[0].credits >= emails.length)) {
          const dataStructure = {
            gamalogic_emailid_vrfy: emails,
          };
          console.time('API Call for Batch Email Verification');
          response = await axios.post(
            `https://gamalogic.com/batchemailvrf?apikey=${apiKey}&speed_rank=0&file_name=${fileName}&team_member_api_key=${memberKey}&email_field=${columnFields.emailField[1]}`,
            dataStructure
          );
          console.timeEnd('API Call for Batch Email Verification');
          batchId = response.data['batch id']
          if (response.data.error !== undefined && response.data.error == false) {
            console.time('DB Query for Batch Link');
            files = await dbConnection.query(`SELECT * FROM useractivity_batch_link where id='${response.data["batch id"]}'`)
            console.timeEnd('DB Query for Batch Link');
            let content = `<p>This is to inform you that the batch email verification process for the file ${fileName} has been started.</p>
          <p>Please note that the verification process may take some time depending on the size of the file and the number of emails to be verified.</p>
          <p>Thank you for using our service.</p>
          <div class="verify">
          <a href="${urls.frontendUrl}/dashboard/file-upload"><button
                  class="verifyButton">Download</button></a>
  
          </div>`
            console.time('Sending Email Notification');
            sendEmail(
              req.user[0][0].username,
              req.user[0][0].emailid,
              "Batch Email Verification Started",
              basicTemplate(req.user[0][0].username, content)
            );
            console.timeEnd('Sending Email Notification');
            // res.status(200).json({ message: response.data.message, files: files[0][0] });
          } else {
            const errorMessage = Object.values(response.data)[0];
            let errorREsponse = await ErrorHandler("batchEmailValidation Controller", errorMessage, req);
            res.status(400).json({ error: errorMessage, errorREsponse });
          }
        } else {
          res.status(400).json({ error: 'You dont have enough to do this' });
        }
      } else {
        console.timeEnd('Team Check & DB Query');

        apiKey = req.user[0][0].api_key;
        let finalFreeDate = new Date(req.user[0][0].free_final);
        let currentDate = new Date();
        if ((req.user[0][0].credits + req.user[0][0].credits_free >= emails.length && finalFreeDate > currentDate) || (req.user[0][0].credits >= emails.length)) {
          const dataStructure = {
            gamalogic_emailid_vrfy: emails,
          };
          console.time('API Call for Batch Email Verification');
          response = await axios.post(
            `https://gamalogic.com/batchemailvrf?apikey=${apiKey}&speed_rank=0&file_name=${fileName}&email_field=${columnFields.emailField[1]}`,
            dataStructure
          );
          console.timeEnd('API Call for Batch Email Verification');
          batchId = response.data['batch id']
          if (response.data.error !== undefined && response.data.error == false) {
            console.time('DB Query for Batch Link file fetching');
            files = await dbConnection.query(`SELECT * FROM useractivity_batch_link where id='${response.data["batch id"]}'`)
            console.timeEnd('DB Query for Batch Link file fetching');
            let content = `<p>This is to inform you that the batch email verification process for the file ${fileName} has been started.</p>
          <p>Please note that the verification process may take some time depending on the size of the file and the number of emails to be verified.</p>
          <p>Thank you for using our service.</p>
          <div class="verify">
          <a href="${urls.frontendUrl}/dashboard/file-upload"><button
                  class="verifyButton">Download</button></a>
  
          </div>`
            console.time('Sending Email Notification');
            sendEmail(
              req.user[0][0].username,
              req.user[0][0].emailid,
              "Batch Email Verification Started",
              basicTemplate(req.user[0][0].username, content)
            );
            console.timeEnd('Sending Email Notification');
            // res.status(200).json({ message: response.data.message, files: files[0][0] });
          } else {
            const errorMessage = Object.values(response.data)[0];
            let errorREsponse = await ErrorHandler("batchEmailValidation Controller", errorMessage, req);
            res.status(400).json({ error: errorMessage, errorREsponse });
          }
        } else {
          res.status(400).json({ error: 'You dont have enough to do this' });
        }
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const formData = new FormData();
      formData.append('file', streamifier.createReadStream(req.file.buffer), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      console.time('File Upload API Call');
      const fileUpload = await axios.post(
        `http://service.gamalogic.com/dashboard-file-upload?is_dashboard=1&apikey=${apiKey}&application=uploadverify&batchId=${batchId}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.timeEnd('File Upload API Call');
      if (fileUpload.data) {
        console.time('DB Update for Uploaded File');
        await dbConnection.query(`UPDATE useractivity_batch_link SET save_upload_file='${fileUpload.data}' WHERE id='${batchId}'`);
        console.timeEnd('DB Update for Uploaded File');
      }
      const currentTime = new Date().toLocaleString();

      await dbConnection.query(`INSERT INTO notification (userid, header, content, time, isRead,type) VALUES (?, ?, ?, ?, ?,?)`, [
        req.user[0][0].rowid,
        "Batch Email Verification Initiated",
        `Email verification has started for the file ${fileName}. Processing is underway, please wait for the results.`,
        currentTime,
        0,
        'validation'
      ])
      const socketId = activeUsers.get(req.user[0][0].rowid);
      //  console.log(socketId, 'userrrrrrrrrrrrrrrrr')

      if (socketId) {
        // console.log('inside progeresss')
        io.to(socketId).emit("progress", {
          header: "Batch Email Verification Initiated",
          content: "Email verification has started for the file one_find_10_with_extra_Data.csv. Processing is underway, please wait for the results.",
          time: currentTime
        });
      }
      res.status(200).json({ message: response.data.message, files: files[0][0] });

    } catch (error) {
      console.log(error);
      let errorREsponse = await ErrorHandler("batchEmailValidation Controller", error, req);
      res.status(500).json({ error: "Internal Server Error", errorREsponse });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
      console.timeEnd('Total Execution Time');
    }

  },
  batchEmailStatus: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      // let apiKey = req.user.api_key;
      let apiKey
      if (req.user.team_id && req.user.team_id !== 'null' && req.user.team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user.team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user.api_key;
      }
      let emailStatus = await axios.get(
        `https://gamalogic.com/batchstatus/?apikey=${apiKey}&batchid=${req.query.id}`
      );
      res.status(200).json({ emailStatus: emailStatus.data })
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  downloadEmailVerificationFile: async (req, res) => {
    try {
      // let apiKey = req.user[0][0].api_key;
      let dbConnection = req.dbConnection

      let apiKey
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user[0][0].api_key;
      }
      let fileToDownload = await req.dbConnection.query(`SELECT file_upload,save_upload_file from useractivity_batch_link where id='${req.query.batchId}'`)
      let fileUpload = fileToDownload[0][0].save_upload_file || fileToDownload[0][0].file_upload
      if (req.query.alreadyDownloaded == 'true') {
        try {
          console.log('first part ')
          // verdheoruError
          const fileUrl = `http://service.gamalogic.com/dashboard-file-download?apikey=${apiKey}&application=verified&batchid=${req.query.batchId}&filename=${fileUpload}`;
          const response = await axios.get(fileUrl, { responseType: 'stream' });
          let fileName = fileUpload
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          res.setHeader('Content-Type', response.headers['content-type']);
          response.data.pipe(res);
        } catch (error) {
          console.error('Error downloading file:', error);
          ErrorHandler("downloadEmailValidation Already Download  Controller", error, req);
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
      else {
        try {
          let download = await axios.get(
            `https://gamalogic.com/batchresult/?apikey=${apiKey}&batchid=${req.query.batchId}`
          );
          console.log(download.data, 'downloadddddddddd')
          const lastDotIndex = fileUpload.lastIndexOf('.');

          let fileName;
          let extention
          if (lastDotIndex === -1) {
            fileName = `${fileUpload}_${batchId}`;
          } else {
            const baseName = fileUpload.slice(0, lastDotIndex);
            extention = fileUpload.slice(lastDotIndex + 1);
            fileName = `${baseName}_${req.query.batchId}.${extention}`;
          }
          // let fileName = fileUpload.split('.')[0] + '_' + req.query.batchId + '.' + fileUpload.split('.')[1]
          console.log(fileName, 'fileNamee')
          let NewDownload = await axios.get(
            `http://service.gamalogic.com/dashboard-file-download?apikey=${apiKey}&batchid=${req.query.batchId}&filename=${fileUpload}&application=uploadverify`, { responseType: 'arraybuffer' }
          );
          console.log(NewDownload.data, 'new Download')
          // let extention = fileUpload.split('.')[1]
          const validationData = download.data.gamalogic_emailid_vrfy;
          let uploadedFileData = []
          let headerAvailable = true
          if (extention === 'csv' || extention === 'txt') {
            const fileContent = NewDownload.data.toString('utf-8');
            const parsedData = Papa.parse(fileContent, {
              header: false, // Do not treat the first row as headers
              skipEmptyLines: true
            }).data;
            console.log(parsedData, 'parsedData')
            // Check if the first row contains valid email addresses
            const isValidEmail = (email) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(email);
            };

            const firstRow = parsedData[0];
            const isFirstRowData = firstRow.some(cell => isValidEmail(cell));
            console.log(isFirstRowData, 'isfirstRowData')
            let headers;
            // uploadedFileData;

            if (isFirstRowData) {
              headerAvailable = false
              // If the first row contains valid emails, it is data, so add numeric headers
              const numColumns = firstRow.length;
              headers = Array.from({ length: numColumns }, (_, i) => String.fromCharCode(65 + i))
              uploadedFileData = [headers, ...parsedData];
              uploadedFileData.splice(0, 1)
            } else {
              // If the first row does not contain valid emails, treat it as headers
              headers = firstRow.map(header => header.trim()); // Use the first row as headers
              uploadedFileData = parsedData.slice(1);
              // Remove the first row (headers) from the data
            }

            // Convert the data into an array of objects with headers as keys
            uploadedFileData = uploadedFileData.map(row => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
              });
              return rowData;
            });
            console.log(uploadedFileData, 'upload file data')
          } else if (extention === 'xls' || extention === 'xlsx') {
            const workbook = XLSX.read(NewDownload.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            uploadedFileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log(uploadedFileData, 'upload file data 11')

            const isValidEmail = (email) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(email);
            }

            const firstRow = uploadedFileData[0];
            const isFirstRowData = firstRow.some(cell => isValidEmail(cell));
            console.log(isFirstRowData, 'is firstRow')
            // Separate headers and data
            let headers;
            if (isFirstRowData) {
              // headerAvailable=false
              // If the first row contains valid emails, it is data, so add numeric headers
              const numColumns = firstRow.length;
              console.log(numColumns, 'num columns')
              headers = Array.from({ length: numColumns }, (_, i) => String.fromCharCode(65 + i))
              // headers = Array.from({ length: numColumns }, (_, i) => i.toString()); // ["0", "1", "2", ...]
              console.log(headers, 'headerssss')
              uploadedFileData = [headers, ...uploadedFileData];
              uploadedFileData.splice(0, 1)
              console.log(uploadedFileData, 'uploaded file dataaaaaaa')
            } else {
              // If the first row does not contain valid emails, treat it as headers
              headers = firstRow.map(header => header.trim()); // Use the first row as headers
              uploadedFileData = uploadedFileData.slice(1); // Remove the first row (headers) from the data
            }
            console.log(headers, uploadedFileData, 'headersssss')
            // const [headers, ...dataRows] = uploadedFileData;
            uploadedFileData = uploadedFileData.map(row => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
              });
              return rowData;
            });
          } else {
            throw new Error('Unsupported file format');
          }
          console.log(uploadedFileData, 'upload file data 222')

          const headers = Object.keys(uploadedFileData[0]);

          const updatedData = uploadedFileData.map(record => {
            let values
            if (extention == 'txt') {
              values = Object.values(record)[0];
            } else {
              values = Object.values(record)
            }
            console.log(values, 'values Dataaaaaa')
            // console.log(values,'validation and upload file data uploaded file Data')
            const matchedDomain = validationData.find(
              item => values.includes(item.emailid)
            );

            console.log(matchedDomain, 'matchDomain ')
            // const email = matchedDomain && matchedDomain.email_address !== '0' ? matchedDomain.email_address : '';
            // const isCatchall = matchedDomain ? matchedDomain.is_catchall : '0';
            let status = "";
            if (matchedDomain) {
              if (matchedDomain.is_catchall == true) {
                status = 'Catch All Address'
              }
              else if (matchedDomain.is_unknown == true) {
                status = "Unknown";
              }
              else if (matchedDomain.is_valid == true && matchedDomain.is_catchall == false) {
                status = "Valid Address";
              }
              else {
                status = "Not Valid Address";
              }
              // if (matchedDomain.message == 'Valid ID') {
              //   status = "Valid Address";
              // } else if (matchedDomain.message == 'Not Valid ID') {
              //   status = "Not Valid Address";
              // }
              // else if (matchedDomain.message == 'Catch all ID') {
              //   status = 'Catch All Address'
              // } else {
              //   status = "Unknown";
              // }
            }


            const row = headers.map(header => record[header] || '');
            // row.push(email)
            row.push(status);

            return row;
          });
          const resultHeaders = [
            ...headers,
            // "email",
            "status"
          ];
          const finalData = [...resultHeaders, ...updatedData];
          const DataForFileCreation = [resultHeaders, ...updatedData]
          console.log(DataForFileCreation, 'data for file creation ')

          const sanitizedDataForFileCreation = DataForFileCreation.filter(row => {
            return row.some(cell => cell.trim() !== ''); // Keep rows with at least one non-empty cell
          });

          console.log(sanitizedDataForFileCreation, 'sanitized DataForFileCreation');
          let newFileName = `${fileUpload}`;
          let filePath = path.join(__dirname, '..', 'temp', newFileName);

          if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });
          }

          // Create the file based on the extension
          if (extention === 'csv' || extention === 'txt') {
            let fileContent;

            if (extention === 'csv') {
              // Use Papa.unparse for CSV files
              fileContent = Papa.unparse(DataForFileCreation);
              fs.writeFileSync(filePath, '\ufeff' + fileContent, { encoding: 'utf8' });

            } else if (extention === 'txt') {
              let fileContent;
              // Include all rows if headers are available
              fileContent = sanitizedDataForFileCreation.map(row => row.join(',')).join('\n');


              try {
                // Ensure the directory exists
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }

                // Write the file with utf-8 encoding
                fs.writeFileSync(filePath, fileContent, 'utf-8');
              } catch (error) {
                console.error('Error writing file:', error);
                throw new Error('Failed to write file');
              }
            }
          } else if (extention === 'xls' || extention === 'xlsx') {
            const worksheet = XLSX.utils.aoa_to_sheet(DataForFileCreation);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            XLSX.writeFile(workbook, filePath);
          }

          // Send the new file to another API
          const fileStream = fs.createReadStream(filePath);
          const formData = new FormData();
          formData.append('file', fileStream, {
            filename: newFileName,
            contentType: `application/${extention}`,
          });

          const response = await axios.post(
            `http://service.gamalogic.com/dashboard-file-upload?is_dashboard=1&apikey=${apiKey}&application=verified&batchId=${req.query.batchId}&filename=${fileUpload}`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
              },
            }
          );
          // console.log(response, 'response from new file upload')
          if (response.data) {
            await dbConnection.query(`UPDATE useractivity_batch_link SET is_downloaded = 1 WHERE id='${req.query.batchId}'`);
          }
          res.status(200).json({
            headers: resultHeaders,
            data: updatedData,
            fileName: fileUpload
          });
        } catch (error) {
          console.error('Error processing file:', error);
          ErrorHandler("downloadEmailValidation New Download  Controller", error, req);
          res.status(500).json({ error: 'Failed to process file' });
        }
      }

      // res.status(200).json({ datas: download.data, fileName: fileName[0][0].file_upload });
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailVerificationFile Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  searchValidationFiles: async (req, res) => {
    let dbConnection;
    try {
      dbConnection = req.dbConnection;
      const searchQuery = req.query.searchQuery ? `%${req.query.searchQuery}%` : '%'; // Add wildcard for partial matching

      if (req.user[0][0] && req.user[0][0].rowid != null) {
        let files;
        if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
          files = await dbConnection.query(
            `SELECT * 
             FROM useractivity_batch_link 
             WHERE team_member_id = '${req.user[0][0].rowid}' 
               AND (error_id IS NULL OR error_id = 0) 
               AND file_upload LIKE ? ORDER BY date_time DESC;`,
            [searchQuery]
          );
          console.log('first');
        } else {
          files = await dbConnection.query(
            `SELECT * 
             FROM useractivity_batch_link 
             WHERE userid = '${req.user[0][0].rowid}' 
               AND (error_id IS NULL OR error_id = 0) 
               AND file_upload LIKE ? ORDER BY date_time DESC;`,
            [searchQuery]
          );
          console.log('second');
        }
        res.status(200).json(files[0]);
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("search validation files Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },


  getAlreadyCheckedBatchEmailFinderFiles: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      if (req.user[0][0] && req.user[0][0].rowid != null) {
        if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
          let files = await dbConnection.query(
            `SELECT * FROM useractivity_batch_finder_link WHERE team_member_id='${req.user[0][0].rowid}' AND (error_id IS NULL OR error_id = 0) ORDER BY date_time DESC LIMIT 6 OFFSET ${(req.query.page - 1) * 6};`
          );
          console.log('first')
          res.status(200).json(files[0]);
        } else {
          let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where userid='${req.user[0][0].rowid}' AND (error_id IS NULL OR error_id = 0) ORDER BY date_time DESC LIMIT 6 OFFSET ${(req.query.page - 1) * 6};`)
          res.status(200).json(files[0])
        }
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("getAlreadyCheckedBatchEmailFinderFiles Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  batchEmailFinder: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let apiKey
      const columnFields = JSON.parse(req.body.fields);
      const results = JSON.parse(req.body.results);
      let batchId
      let response
      let files
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key,credits,credits_free,free_final FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
        let memberKey = req.user[0][0].api_key
        let finalFreeDate = new Date(admin[0].free_final);
        let currentDate = new Date();
        //checking that we have enough credits to do this 
        if ((admin[0].credits + admin[0].credits_free >= (results.data.length * 10) && finalFreeDate > currentDate) || (admin[0].credits >= results.data.length * 10)) {
          const data = {
            gamalogic_emailid_finder: results.data,
          };
          response = await axios.post(
            `https://gamalogic.com/batch-email-discovery/?apikey=${apiKey}&file_name=${results.fileName}&team_member_api_key=${memberKey}&first_name_field=${columnFields.firstNameField[1]}&last_name_field=${columnFields.lastNameField[1]}&domain_name_field=${columnFields.domainField[1]}`,
            data
          );
          batchId = response.data['batch id']
          console.log(response.data['batch id'], 'rsssssssssssssp')
          if (response.data.error !== undefined && response.data.error == false) {
            files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where id='${response.data["batch id"]}'`)
            let content = `<p>This is to inform you that the batch email finder process for the file ${results.fileName} has been started.</p>
        <p>Please note that the finding process may take some time depending on the size of the file and the number of emails to be find.</p>
        <p>Thank you for using our service.</p>
        <div class="verify">
        <a href="${urls.frontendUrl}/dashboard/file-upload-finder"><button
                class="verifyButton">Download</button></a>

        </div>`
            //sending email when finding process started 
            sendEmail(
              req.user[0][0].username,
              req.user[0][0].emailid,
              "Batch Email Finder Started",
              basicTemplate(req.user[0][0].username, content)
            );
            // res.status(200).json({ message: response.data.message, files: files[0][0] });
          }
          else {
            const errorMessage = Object.values(response.data)[0];
            let errorREsponse = await ErrorHandler("batchEmailFinder Controller", errorMessage, req);
            res.status(400).json({ error: errorMessage, errorREsponse });
          }
        } else {
          res.status(400).json({ error: 'You dont have enough to do this' });
        }

      } else {
        apiKey = req.user[0][0].api_key;
        let finalFreeDate = new Date(req.user[0][0].free_final);
        let currentDate = new Date();

        if ((req.user[0][0].credits + req.user[0][0].credits_free >= (results.data.length * 10) && finalFreeDate > currentDate) || (req.user[0][0].credits >= results.data.length * 10)) {
          const data = {
            gamalogic_emailid_finder: results.data,
          };
          response = await axios.post(
            `https://gamalogic.com/batch-email-discovery/?apikey=${apiKey}&file_name=${results.fileName}&first_name_field=${columnFields.firstNameField[1]}&last_name_field=${columnFields.lastNameField[1]}&domain_name_field=${columnFields.domainField[1]}`,
            data
          );
          batchId = response.data['batch id']
          console.log(response, 'rsssssssssssssp')
          if (response.data.error !== undefined && response.data.error == false) {
            files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where id='${response.data["batch id"]}'`)
            let content = `<p>This is to inform you that the batch email finder process for the file ${results.fileName} has been started.</p>
        <p>Please note that the finding process may take some time depending on the size of the file and the number of emails to be find.</p>
        <p>Thank you for using our service.</p>
        <div class="verify">
        <a href="${urls.frontendUrl}/dashboard/file-upload-finder"><button
                class="verifyButton">Download</button></a>

        </div>`
            //sending email when finding process started 
            sendEmail(
              req.user[0][0].username,
              req.user[0][0].emailid,
              "Batch Email Finder Started",
              basicTemplate(req.user[0][0].username, content)
            );
            // res.status(200).json({ message: response.data.message, files: files[0][0] });
          }
          else {
            const errorMessage = Object.values(response.data)[0];
            let errorREsponse = await ErrorHandler("batchEmailFinder Controller", errorMessage, req);
            res.status(400).json({ error: errorMessage, errorREsponse });
          }
        } else {
          res.status(400).json({ error: 'You dont have enough to do this' });
        }
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const formData = new FormData();
      formData.append('file', streamifier.createReadStream(req.file.buffer), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      const FileUpload = await axios.post(
        `http://service.gamalogic.com/dashboard-file-upload?is_dashboard=1&apikey=${apiKey}&application=uploadfinder&batchId=${batchId}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log('')
      if (FileUpload.data) {
        console.log('inside response .data')
        await dbConnection.query(`UPDATE useractivity_batch_finder_link SET save_file_upload='${FileUpload.data}' WHERE id='${batchId}'`);
      }

      const currentTime = new Date().toLocaleString();

      await dbConnection.query(`INSERT INTO notification (userid, header, content, time, isRead,type) VALUES (?, ?, ?, ?, ?,?)`, [
        req.user[0][0].rowid,
        "Batch Email Finder Initiated",
        `Email Finder has started for the file ${results.fileName}. Processing is underway, please wait for the results.`,
        currentTime,
        0,
        'finder'
      ])
      const socketId = activeUsers.get(req.user[0][0].rowid);
      console.log(socketId, 'userrrrrrrrrrrrrrrrr')

      if (socketId) {
        console.log('inside progeresss')
        io.to(socketId).emit("progress", {
          header: "Batch Email Verification Initiated",
          content: "Email verification has started for the file one_find_10_with_extra_Data.csv. Processing is underway, please wait for the results.",
          time: currentTime
        });
      }
      res.status(200).json({ message: response.data.message, files: files[0][0] });

    } catch (error) {
      console.log(error)
      let errorREsponse = await ErrorHandler("batchEmailFinder Controller", error, req);
      res.status(500).json({ error: "Internal Server Error", errorREsponse });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  batchEmailFinderFileUpload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      console.log(req.file.buffer, 'reqqqqqqqqqqq')
      const formData = new FormData();
      formData.append('file', streamifier.createReadStream(req.file.buffer), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      console.log(req.user[0][0].api_key, 'req.userrrrrrrrrr')
      const response = await axios.post(
        `http://service.gamalogic.com/dashboard-file-upload?is_dashboard=1&apikey=${req.user[0][0].api_key}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log(response, 'response from api')
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  batchEmailFinderStatus: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      // let apiKey = req.user.api_key;
      let apiKey
      if (req.user.team_id && req.user.team_id !== 'null' && req.user.team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user.team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user.api_key;
      }
      let emailStatus = await axios.get(
        `https://gamalogic.com/batch-email-discovery-status/?apikey=${apiKey}&batchid=${req.query.id}`
      );
      res.status(200).json({ emailStatus: emailStatus.data });
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  downloadEmailFinderResultFile: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      // console.log(verdheoruError)
      let apiKey
      if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
        let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${req.user[0][0].team_id}`);
        apiKey = admin[0].api_key;
      } else {
        apiKey = req.user[0][0].api_key;
      }
      console.log(req.query.alreadyDownloaded, typeof (req.query.alreadyDownloaded), 'already downloaded')
      let fileToDownload = await req.dbConnection.query(`SELECT file_upload,save_file_upload from useractivity_batch_finder_link where id='${req.query.batchId}'`)
      let fileUpload = fileToDownload[0][0].save_file_upload || fileToDownload[0][0].file_upload
      if (req.query.alreadyDownloaded == 'true') {
        try {
          console.log('first part ')
          const fileUrl = `http://service.gamalogic.com/dashboard-file-download?apikey=${apiKey}&application=finder&batchid=${req.query.batchId}&filename=${fileUpload}`;
          const response = await axios.get(fileUrl, { responseType: 'stream' });
          const lastDotIndex = fileUpload.lastIndexOf('.');
          let fileName;
          let extention
          if (lastDotIndex === -1) {
            fileName = `${fileUpload}_${batchId}`;
          } else {
            const baseName = fileUpload.slice(0, lastDotIndex);
            extention = fileUpload.slice(lastDotIndex + 1);
            fileName = `${baseName}_finder.${extention}`;
          }
          // let fileName = fileUpload.split('.')[0] + 'finder' + '.' + fileUpload.split('.')[1];
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          res.setHeader('Content-Type', response.headers['content-type']);
          response.data.pipe(res);
        } catch (error) {
          console.error('Error downloading file:', error);
          ErrorHandler("downloadEmailFinderFile Already Download  Controller", error, req);
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
      else {
        try {
          console.log('second part ')
          let download = await axios.get(
            `https://gamalogic.com/batch-email-discovery-result/?apikey=${apiKey}&batchid=${req.query.batchId}`
          );
          const lastDotIndex = fileUpload.lastIndexOf('.');

          let fileName;
          let extention
          if (lastDotIndex === -1) {
            fileName = `${fileUpload}_${batchId}`;
          } else {
            const baseName = fileUpload.slice(0, lastDotIndex);
            extention = fileUpload.slice(lastDotIndex + 1);
            fileName = `${baseName}_${req.query.batchId}.${extention}`;
          }
          // let fileName = fileUpload.split('.')[0] + '_' + req.query.batchId + '.' + fileUpload.split('.')[1]
          let NewDownload = await axios.get(
            `http://service.gamalogic.com/dashboard-file-download?apikey=${apiKey}&batchid=${req.query.batchId}&filename=${fileUpload}&application=uploadfinder`, { responseType: 'arraybuffer' }
          );
          // let extention = fileUpload.split('.')[1]
          const discoveryData = download.data.gamalogic_discovery;
          let uploadedFileData = []
          if (extention === 'csv' || extention === 'txt') {
            const fileContent = NewDownload.data.toString('utf-8');
            uploadedFileData = Papa.parse(fileContent, {
              header: true,
              skipEmptyLines: true
            }).data;
          } else if (extention === 'xls' || extention === 'xlsx') {
            const workbook = XLSX.read(NewDownload.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            uploadedFileData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Separate headers and data
            const [headers, ...dataRows] = uploadedFileData;
            uploadedFileData = dataRows.map(row => {
              const rowData = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
              });
              return rowData;
            });
          } else {
            throw new Error('Unsupported file format');
          }
          const headers = Object.keys(uploadedFileData[0]);

          const updatedData = uploadedFileData.map(record => {
            let values
            if (extention == 'txt') {
              const recordValue = Object.values(record)[0];
              values = recordValue
            } else {
              values = Object.values(record)
            }
            const matchedDomain = discoveryData.find(
              item => values.includes(item.domain) && values.includes(item.firstname) && values.includes(item.lastname)
            );

            const email = matchedDomain && matchedDomain.email_address !== '0' ? matchedDomain.email_address : '';
            const isCatchall = matchedDomain ? matchedDomain.is_catchall : '0';
            let remarks = "";
            if (isCatchall == 1) {
              remarks = "Catch all Address";
            } else if (isCatchall == 0 && email != '') {
              remarks = "Valid Address";
            } else {
              remarks = "";
            }

            const row = headers.map(header => record[header] || '');
            row.push(email)
            row.push(remarks);

            return row;
          });
          const resultHeaders = [
            ...headers,
            "email",
            "remarks"
          ];
          const finalData = [...resultHeaders, ...updatedData];
          const DataForFileCreation = [resultHeaders, ...updatedData]

          let newFileName = `${fileUpload}`;
          let filePath = path.join(__dirname, '..', 'temp', newFileName);

          if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });
          }

          // Create the file based on the extension
          if (extention === 'csv' || extention === 'txt') {
            const csvData = Papa.unparse(DataForFileCreation);
            fs.writeFileSync(filePath, csvData);
          } else if (extention === 'xls' || extention === 'xlsx') {
            const worksheet = XLSX.utils.aoa_to_sheet(DataForFileCreation);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            XLSX.writeFile(workbook, filePath);
          }

          // Send the new file to another API
          const fileStream = fs.createReadStream(filePath);
          const formData = new FormData();
          formData.append('file', fileStream, {
            filename: newFileName,
            contentType: `application/${extention}`,
          });

          const response = await axios.post(
            `http://service.gamalogic.com/dashboard-file-upload?is_dashboard=1&apikey=${apiKey}&application=finder&batchId=${req.query.batchId}&filename=${fileUpload}`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
              },
            }
          );
          console.log(response, 'response from new file upload')
          if (response.data) {
            await dbConnection.query(`UPDATE useractivity_batch_finder_link SET is_download = 1 WHERE id='${req.query.batchId}'`);
          }
          res.status(200).json({
            headers: resultHeaders,
            data: updatedData,
            fileName: fileUpload
          });
        } catch (error) {
          console.error('Error processing file:', error);
          ErrorHandler("downloadEmailFinderFile New Download  Controller", error, req);
          res.status(500).json({ error: 'Failed to process file' });
        }
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailFinderFile Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  searchFinderFiles: async (req, res) => {
    let dbConnection;
    try {
      dbConnection = req.dbConnection;
      const searchQuery = req.query.searchQuery ? `%${req.query.searchQuery}%` : '%';

      if (req.user[0][0] && req.user[0][0].rowid != null) {
        let files;
        if (req.user[0][0].team_id && req.user[0][0].team_id !== 'null' && req.user[0][0].team_id !== null) {
          files = await dbConnection.query(
            `SELECT * 
             FROM useractivity_batch_finder_link  
             WHERE team_member_id = '${req.user[0][0].rowid}' 
               AND (error_id IS NULL OR error_id = 0) 
               AND file_upload LIKE ? ORDER BY date_time DESC;`,
            [searchQuery]
          );
          console.log('first');
        } else {
          files = await dbConnection.query(
            `SELECT * 
             FROM useractivity_batch_finder_link  
             WHERE userid = '${req.user[0][0].rowid}' 
               AND (error_id IS NULL OR error_id = 0) 
               AND file_upload LIKE ? ORDER BY date_time DESC;`,
            [searchQuery]
          );
          console.log('second');
        }
        // console.log(files[0], 'filesssssssss')
        res.status(200).json(files[0]);
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("search finder files Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },

  PayPalUpdateCredit: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits,is_referer_by from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let newBalance = user[0][0].credits + req.body.credits

      let content = `
      <p>Your payment for $${Number(req.body.cost).toLocaleString()} for ${Number(req.body.credits).toLocaleString()} credits has been successfully processed.</p>
      
      <p>If you have any questions or concerns regarding this payment, please feel free to contact us.</p>
      `
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      //finding access token from paypal
      const clientId = process.env.PAYPAL_CLIENTID;
      const clientSecret = process.env.PAYPAL_CLIENTSECRET;

      const url = `${urls.paypalUrl}/v1/oauth2/token`;

      const data = new URLSearchParams({
        grant_type: 'client_credentials',
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      };

      let payPalToken = await axios.post(url, data, { headers })

      //finding order details based on that order id and access token
      const payPaldetails = await axios.get(`${urls.paypalUrl}/v2/checkout/orders/${req.body.data.orderID}`, {
        headers: {
          'Authorization': `Bearer ${payPalToken.data.access_token}`
        }
      });
      let details = payPaldetails.data;
      let query = `
          INSERT INTO gl_paypal (
              userid, order_id, order_time, email, name, payer_paypal_id, amount,
              currency, recipient_name, line1, city, country_code, postal_code, state,
              paypal_fee, net_amount, gross_amount, gross_currency,credits
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `;

      let values = [
        user[0][0]?.rowid ?? null,
        req.body?.data?.orderID ?? null,
        details?.create_time ?? null,
        details?.payer?.email_address ?? null,
        details?.purchase_units?.[0]?.shipping?.name?.full_name ?? null,
        details?.payer?.payer_id ?? null,
        details?.purchase_units?.[0]?.amount?.value ?? null,
        details?.purchase_units?.[0]?.amount?.currency_code ?? null,
        details?.purchase_units?.[0]?.shipping?.name?.full_name ?? null,
        details?.purchase_units?.[0]?.shipping?.address?.address_line_1 ?? null,
        details?.purchase_units?.[0]?.shipping?.address?.admin_area_2 ?? null,
        details?.purchase_units?.[0]?.shipping?.address?.country_code ?? null,
        details?.purchase_units?.[0]?.shipping?.address?.postal_code ?? null,
        details?.purchase_units?.[0]?.shipping?.address?.admin_area_1 ?? null,
        details?.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.paypal_fee?.value ?? null,
        details?.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.net_amount?.value ?? null,
        details?.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.gross_amount?.value ?? null,
        details?.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.gross_amount?.currency_code ?? null,
        req.body.credits
      ];


      await dbConnection.query(query, values);
      updateLeadStatus(req.user[0][0].emailid)
      let purchaseDetailsForZohoBooks = {
        rate: details?.purchase_units?.[0]?.amount?.value ?? null,
        credits: req.body.credits,
        methord: 'Pay as you go',
        currency: process.env.BOOKS_USD_CURRENCY,
      }
      try {
        let zohoBook = await ZohoBooks(req.user[0][0], purchaseDetailsForZohoBooks)
        if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1,id_zoho_books='${zohoBook.zohoBookContactId}' WHERE emailid='${req.user[0][0].emailid}'`)
        }
        else {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)
        }

      } catch (error) {
        console.error("Error occurred in ZohoBooks function:", error);
        await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)
      }
      if (user[0][0].is_referer_by == 1) {
        try {
          let resp = await PurchaseApi(req.user[0][0].emailid, details?.purchase_units?.[0]?.amount?.value ?? null, req.body?.data?.orderID ?? null, user[0][0]?.rowid ?? null)
        } catch (error) {
          ErrorHandler("PayPalUpdateCredit Controller Thrive purchase push section", error, req);
        }
      }

      const currentTime = new Date().toISOString();
      await dbConnection.query(
        `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user[0][0].rowid,
          "Payment Successful",
          `Your payment for $${Number(req.body.cost).toLocaleString()} for ${Number(
            req.body.credits
          ).toLocaleString()} credits has been successfully processed.`,
          currentTime,
          0,
          "payment",
        ]
      );

      const socketId = activeUsers.get(req.user[0][0].rowid);

      if (socketId) {
        console.log('inside progeresss')
        io.to(socketId).emit("progress", {
          header: "Payment Successful",
          content: `Your payment for $${Number(req.body.cost).toLocaleString()} for ${Number(
            req.body.credits
          ).toLocaleString()} credits has been successfully processed.`,
          time: currentTime
        });
      }
      res.status(200).json('Successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("PayPalUpdateCredit Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  PayPalCreditFailureEmail: async (req, res) => {
    try {
      let content = ` <p>We regret to inform you that your payment for $${Number(req.body.cost).toLocaleString()} for ${Number(req.body.credits).toLocaleString()} credits was unsuccessful.</p>
      <p>If you have any questions or concerns regarding this issue, please feel free to contact us.</p>`
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment Unsuccessful",
        basicTemplate(req.user[0][0].username, content)
      );

      res.status(200)
    } catch (error) {
      console.log(error);
      ErrorHandler("PayPalCreditFailureEmail Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  payPalSubscription: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = req.user[0][0]
      const { subscriptionId, planId, paymentDetails } = req.body;
      let content
      if (paymentDetails.period == 'monthly') {
        content = `
        <p>Your payment of $${Number(Math.round(paymentDetails.cost)).toLocaleString()} for ${Number(paymentDetails.credits).toLocaleString()} credits has been successfully processed. Additionally, we have activated your monthly subscription for ${Number(paymentDetails.credits).toLocaleString()} credits.</p>
        
        <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
        `
      }
      else {
        content = `
        <p>We are pleased to inform you that your payment of $${Number(Math.round(paymentDetails.cost)).toLocaleString()} for the annual subscription has been successfully processed, and ${Number(paymentDetails.credits).toLocaleString()} credits have been added to your account for this month.</p>
        
        <p>If you have any questions or need further assistance regarding your payment or subscription, please don't hesitate to reach out to us.</p>
        `
      }
      let isMonthlyInEmail = paymentDetails.period === 'monthly' ? 'Monthly' : 'Annual'
      let sub = `Gamalogic ${isMonthlyInEmail} Subscription Payment successful`
      sendEmail(
        user.username,
        user.emailid,
        sub,
        basicTemplate(user.username, content)
      );
      //finding access token from paypal
      const clientId = process.env.PAYPAL_CLIENTID;
      const clientSecret = process.env.PAYPAL_CLIENTSECRET;

      const url = `${urls.paypalUrl}/v1/oauth2/token`;

      const data = new URLSearchParams({
        grant_type: 'client_credentials',
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      };

      let payPalToken = await axios.post(url, data, { headers })

      //finding order details based on that order id and access token
      const payPaldetails = await axios.get(`${urls.paypalUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${payPalToken.data.access_token}`
        }
      });
      let details = payPaldetails.data;
      let newBalance = user.credits + paymentDetails.credits
      const periodColumn = paymentDetails.period === 'monthly' ? 'is_monthly' : 'is_annual';
      // const nonPeriodColumn = paymentDetails.period === 'monthly' ? 'is_annual' : 'is_monthly'


      // await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1 WHERE emailid='${user.emailid}'`)

      const formatAddress = (address) => {
        return [
          address.address_line_1 || null,
          address.admin_area_2 || null,
          address.admin_area_1 || null,
          address.postal_code || null,
          address.country_code || null
        ].filter(part => part).join(', ');
      };
      let gross_amount = Math.round(details.billing_info.last_payment.amount.value)
      const address = formatAddress(details.subscriber.shipping_address.address);
      let query = `
         INSERT INTO paypal_subscription (
        userid, credits, is_monthly, is_annual,gross_amount, subscription_id, plan_id, start_time, quantity,
        name, address, email_address, payer_id, last_payment, next_billing_time,time_stamp
      ) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `;

      let values = [
        user.rowid ?? null,
        paymentDetails.credits ?? null,
        paymentDetails.period === 'monthly' ? '1' : '0',
        paymentDetails.period != 'monthly' ? '1' : '0',
        gross_amount || null,
        subscriptionId ?? null,
        planId ?? null,
        details.start_time ?? null,
        details.quantity ?? null,
        `${details.subscriber.name.given_name} ${details.subscriber.name.surname}` ?? null,
        address ?? null,
        details.subscriber.email_address ?? null,
        details.subscriber.payer_id ?? null,
        details.billing_info.last_payment.time ?? null,
        details.billing_info.next_billing_time ?? null,
        new Date().toISOString()
      ];
      updateLeadStatus(req.user[0][0].emailid)

      const currentDate = new Date();
      let purchaseDetailsForZohoBooks = {
        rate: gross_amount ?? null,
        credits: paymentDetails.credits,
        methord: `${paymentDetails.period === 'monthly'
          ? `Monthly subscription of ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
          : `Annual subscription of ${currentDate.getFullYear()}`}`,
        currency: process.env.BOOKS_USD_CURRENCY,
      }
      try {
        let zohoBook = await ZohoBooks(req.user[0][0], purchaseDetailsForZohoBooks)
        if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
          const registrationRuery = `
          UPDATE registration 
          SET credits = '${newBalance}', 
              is_premium = 1, 
              ${periodColumn} = 1 ,
              subscription_start_time='${details.start_time}',
              last_payment_time='${details.billing_info.last_payment.time}',
              is_active=1,
              is_pay_as_you_go=0,
              subscription_stop_time=NULL,
              id_zoho_books='${zohoBook.zohoBookContactId}'
          WHERE emailid = '${user.emailid}'
        `;

          await dbConnection.query(registrationRuery);
        }
        else {
          const registrationRuery = `
          UPDATE registration 
          SET credits = '${newBalance}', 
              is_premium = 1, 
              ${periodColumn} = 1 ,
              subscription_start_time='${details.start_time}',
              last_payment_time='${details.billing_info.last_payment.time}',
              is_active=1,
              is_pay_as_you_go=0,
              subscription_stop_time=NULL
          WHERE emailid = '${user.emailid}'
        `;

          await dbConnection.query(registrationRuery);
        }
      } catch (error) {
        const registrationRuery = `
          UPDATE registration 
          SET credits = '${newBalance}', 
              is_premium = 1, 
              ${periodColumn} = 1 ,
              subscription_start_time='${details.start_time}',
              last_payment_time='${details.billing_info.last_payment.time}',
              is_active=1,
              is_pay_as_you_go=0,
              subscription_stop_time=NULL
          WHERE emailid = '${user.emailid}'
        `;

        await dbConnection.query(registrationRuery);
      }



      if (user.is_referer_by == 1) {
        try {
          let orderId = subscriptionId + new Date().toISOString().split('T')[0];
          let resp = await PurchaseApi(req.user[0][0].emailid, gross_amount || null, orderId, req.user[0][0]?.rowid ?? null)
        } catch (error) {
          ErrorHandler("PayPalUpdateCredit Controller Thrive purchase push section", error, req);
          console.log(error)
        }
      }
      await dbConnection.query(query, values);

      const currentTime = new Date().toISOString();
      await dbConnection.query(
        `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.rowid,
          "Subscription Payment Successful",
          `Your ${paymentDetails.period} subscription payment of $${Number(Math.round(paymentDetails.cost)).toLocaleString()} for ${Number(paymentDetails.credits).toLocaleString()} credits has been successfully processed.`,
          currentTime,
          0,
          "subscription",
        ]
      );
      const socketId = activeUsers.get(req.user[0][0].rowid);

      if (socketId) {
        console.log('inside progeresss')
        io.to(socketId).emit("progress", {
          header: "Subscription Payment Successful",
          content: `Your ${paymentDetails.period} subscription payment of $${Number(Math.round(paymentDetails.cost)).toLocaleString()} for ${Number(paymentDetails.credits).toLocaleString()} credits has been successfully processed.`,
          time: currentTime
        });
      }

      res.status(200).json('Successfull')
      dbConnection.release()
    } catch (error) {
      console.log(error);
      ErrorHandler("Paypal subscription Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  payPalWebHook: async (req, res) => {
    try {
      const dbConnection = req.dbConnection; // Ensure this is correctly set up
      const { event_type, resource } = req.body;

      if (event_type === 'PAYMENT.SALE.COMPLETED' || event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
        const clientId = process.env.PAYPAL_CLIENTID;
        const clientSecret = process.env.PAYPAL_CLIENTSECRET;

        const url = `${urls.paypalUrl}/v1/oauth2/token`;
        const data = new URLSearchParams({ grant_type: 'client_credentials' });
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        };

        let payPalToken = await axios.post(url, data, { headers });
        let subId = event_type === 'PAYMENT.SALE.COMPLETED' ? resource.billing_agreement_id : req.body.resource.id
        // Fetch PayPal subscription details
        const payPaldetails = await axios.get(`${urls.paypalUrl}/v1/billing/subscriptions/${subId}`, {
          headers: { 'Authorization': `Bearer ${payPalToken.data.access_token}` }
        });

        const foundItem = paypalPrice.find(([credits, id, planPeriod]) => id === payPaldetails.data.plan_id);
        let credit = foundItem ? foundItem[0] : null;

        let planInDataBase = await dbConnection.query(`SELECT * FROM paypal_subscription WHERE subscription_id = '${payPaldetails.data.id}' ORDER BY id DESC 
          LIMIT 1`);
        if (event_type === 'PAYMENT.SALE.COMPLETED') {
          if (planInDataBase[0].length > 0) {
            const existingEntry = planInDataBase[0][0];
            const existingEntryCreationDate = new Date(existingEntry.start_time).toISOString().split('T')[0]; // Extract date part
            const currentDate = new Date().toISOString().split('T')[0];
            let isSameDay = existingEntryCreationDate === currentDate

            let time_stamp = new Date().toISOString().split('T')[0] === new Date(existingEntry.time_stamp).toISOString().split('T')[0]

            if (!isSameDay && !time_stamp) {
              console.log('inside sameday')
              // ErrorHandler("update paypal webhook checker step 1", req.body, req);
              let details = payPaldetails.data;
              const formatAddress = (address) => {
                return [
                  address.address_line_1 || null,
                  address.admin_area_2 || null,
                  address.admin_area_1 || null,
                  address.postal_code || null,
                  address.country_code || null
                ].filter(part => part).join(', ');
              };
              let gross_amount = Math.round(details.billing_info.last_payment.amount.value)
              const address = formatAddress(details.subscriber.shipping_address.address);

              const paymentDetails = paypalPrice.find(([planCredits, id, planPeriod]) => {
                return id == planInDataBase[0][0].plan_id
              });
              let query = `
                 INSERT INTO paypal_subscription (
                userid, credits, is_monthly, is_annual,gross_amount, subscription_id, plan_id, start_time, quantity,
                name, address, email_address, payer_id, last_payment, next_billing_time,time_stamp
              ) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
              `;
              let creditsToAdd = paymentDetails[2] == 'monthly' ? paymentDetails[0] : (paymentDetails[0] / 12)

              let values = [
                planInDataBase[0][0].userid ?? null,
                creditsToAdd ?? null,
                paymentDetails[2] === 'monthly' ? '1' : '0',
                paymentDetails[2] === 'annually' ? '1' : '0',
                gross_amount || null,
                subId ?? null,
                paymentDetails[1] ?? null,
                details.start_time ?? null,
                details.quantity ?? null,
                `${details.subscriber.name.given_name} ${details.subscriber.name.surname}` ?? null,
                address ?? null,
                details.subscriber.email_address ?? null,
                details.subscriber.payer_id ?? null,
                details.billing_info.last_payment.time ?? null,
                details.billing_info.next_billing_time ?? null,
                new Date().toISOString()
              ];

              await dbConnection.query(query, values);

              let user = await dbConnection.query(`SELECT * FROM registration WHERE rowid = '${planInDataBase[0][0].userid}'`);
              if (user[0].length > 0) {

                let newBalance = user[0][0].credits + creditsToAdd;
                let lastPayment_registration = details.billing_info.last_payment.time ?? new Date().toISOString()
                const currentDate = new Date();
                let purchaseDetailsForZohoBooks = {
                  rate: gross_amount ?? null,
                  credits: creditsToAdd,
                  methord: `${paymentDetails[2] == 'monthly'
                    ? `Monthly subscription of ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                    : `Annual subscription of ${currentDate.getFullYear()}`}`,
                  currency: process.env.BOOKS_USD_CURRENCY
                }
                try {
                  let zohoBook = await ZohoBooks(user[0][0], purchaseDetailsForZohoBooks)
                  if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
                    await dbConnection.query(`UPDATE registration SET credits = '${newBalance}', is_premium = 1,last_payment_time='${lastPayment_registration}',id_zoho_books='${zohoBook.zohoBookContactId}' WHERE rowid = '${planInDataBase[0][0].userid}'`);
                  }
                  else {
                    await dbConnection.query(`UPDATE registration SET credits = '${newBalance}', is_premium = 1,last_payment_time='${lastPayment_registration}' WHERE rowid = '${planInDataBase[0][0].userid}'`);

                  }
                } catch (error) {
                  await dbConnection.query(`UPDATE registration SET credits = '${newBalance}', is_premium = 1,last_payment_time='${lastPayment_registration}' WHERE rowid = '${planInDataBase[0][0].userid}'`);

                }
                if (user[0][0].is_referer_by == 1) {
                  try {
                    let orderId = subId + new Date().toISOString().split('T')[0];
                    console.log(orderId, 'orderIdddddd')
                    let resp = await PurchaseApi(user[0][0].emailid, gross_amount || null, orderId, user[0][0]?.rowid ?? null)
                    console.log(resp, 'resppppppp')
                  } catch (error) {
                    ErrorHandler("PayPalUpdateCredit Controller Thrive purchase push section", error, req);
                    console.log(error)
                  }
                }

                let content
                if (paymentDetails[2] == 'monthly') {
                  content = `
                <p>Your subscription has been renewed successfully. We have processed your payment of $${Number(Math.round(resource.amount.total)).toLocaleString()} for ${Number(credit).toLocaleString()} credits has been successfully processed.</p>
                
                <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
                `
                }
                else {
                  content = `
                <p>Your subscription has been renewed successfully. We have processed your payment of $${Number(Math.round(resource.amount.total)).toLocaleString()} for ${Number(credit).toLocaleString()} credits has been successfully processed.</p>
                
                <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
                `
                }
                let isMonthlyInEmail = paymentDetails[2] == 'monthly' ? 'Monthly' : 'Annual'
                let sub = `Gamalogic ${isMonthlyInEmail} Subscription Payment successful`
                sendEmail(
                  user[0][0].username,
                  user[0][0].emailid,
                  sub,
                  basicTemplate(user[0][0].username, content)
                );

                const currentTime = new Date().toISOString();
                await dbConnection.query(
                  `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                    user[0][0].rowid,
                    "Subscription Payment Successful",
                    `Your ${paymentDetails[2]} subscription payment of $${Number(Math.round(resource.amount.total)).toLocaleString()} for ${Number(credit).toLocaleString()} credits has been successfully processed.`,
                    currentTime,
                    0,
                    "subscription",
                  ]
                );

                const socketId = activeUsers.get(user[0][0].rowid);
                if (socketId) {
                  console.log('inside progress');
                  io.to(socketId).emit("progress", {
                    header: "Subscription Payment Successful",
                    content: `Your ${paymentDetails[2]} subscription payment of $${Number(Math.round(resource.amount.total)).toLocaleString()} for ${Number(credit).toLocaleString()} credits has been successfully processed.`,
                    time: currentTime
                  });
                }
              }
            } else {
              // ErrorHandler("update paypal webhook checker step 2", req.body, req);
              console.log('Dates are the same. No update needed.');
            }

          } else {
            console.log('No record found in database for the given plan_id.');
          }
        } else if (event_type == 'BILLING.SUBSCRIPTION.CANCELLED') {
          console.log('inside cancellation part')
          //handling the subscription cancellation part
          let stopTime = new Date().toISOString()
          await dbConnection.query(
            `UPDATE registration SET is_active=0, subscription_stop_time = ? WHERE rowid = ?`,
            [stopTime, planInDataBase[0][0].userid]
          );
          // console.log(resource,'resource in cancelation part')
          let data = paypalPrice.find(([credit, id, period]) => id == resource.plan_id)
          // console.log(data,'data of cancelation part ')
          let isMonthlyInEmail = data[2] == 'monthly' ? 'Monthly' : 'Annual'
          let content
          if (data[2] == 'monthly') {
            content = `
            <p>We're sorry to see you go! Your monthly subscription has been successfully cancelled.</p>
            
            <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
    
            <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
            `
          } else {
            content = `
            <p>We're sorry to see you go! Your annual subscription has been successfully cancelled.</p>
            
            <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
    
            <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
            `
          }
          let user = await dbConnection.query(`SELECT * from registration WHERE rowid='${planInDataBase[0][0].userid}'`)
          let sub = `Gamalogic ${isMonthlyInEmail} Subscription Cancellation`
          sendEmail(
            user[0][0].username,
            user[0][0].emailid,
            sub,
            basicTemplate(user[0][0].username, content)
          );
          const currentTime = new Date().toISOString();
          await dbConnection.query(
            `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              user[0][0].rowid,
              "Subscription Cancelled",
              `Your ${isMonthlyInEmail} subscription has been successfully cancelled.`,
              currentTime,
              0,
              "subscription",
            ]
          );

          const socketId = activeUsers.get(user[0][0].rowid);
          if (socketId) {
            console.log('inside progress');
            io.to(socketId).emit("progress", {
              header: "Subscription Cancelled",
              content: `Your ${isMonthlyInEmail} subscription has been successfully cancelled.`,
              time: currentTime
            });
          }

        }
        else {
          console.log('inside else part not cancellation or updation')
        }
      }
      res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  RazorpayPayment: async (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });
      const options = {
        amount: Math.floor(req.body.amount) * 100,
        currency: "INR",
        receipt: "info@gamalogic.com",
      };
      const order = await instance.orders.create(options);
      if (!order) return res.status(500).send("Some error occured");

      res.json({ order, planId: req.body.Planid, duration: req.body.duration });
    } catch (error) {
      console.log(error)
      res.status(500).send(error);
      ErrorHandler("RazorpayPayment Controller", error, req);
    }
    finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  razorPayPaymentSuccess: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits from registration WHERE emailid='${req.user[0][0].emailid}'`)

      let newBalance = user[0][0].credits + req.body.credits

      var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET })
      let resp = await instance.payments.fetch(req.body.razorpayPaymentId)
      const {
        id,
        entity,
        amount,
        currency,
        status,
        order_id,
        invoice_id,
        international,
        method,
        amount_refunded,
        refund_status,
        captured,
        description,
        card_id,
        bank,
        wallet,
        vpa,
        email,
        contact,
        notes,
        fee,
        tax,
        error_code,
        error_description,
        error_source,
        error_step,
        error_reason,
        acquirer_data,
        created_at
      } = resp;

      const amountInRupees = amount / 100;
      const feeInRupees = fee / 100;
      const taxInRupees = tax / 100;

      const query = `
    INSERT INTO gl_razorpay (
       rp_id,user_id, entity, amount, currency, status, order_id, invoice_id,
      international, method, amount_refunded, refund_status, captured,
      description, card_id, bank, wallet, vpa, email, contact, address, fee,
      tax, error_code, error_description, error_source, error_step,
      error_reason, bank_transaction_id, created_at,payment_id,credits
    ) VALUES ( ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
  `;

      const values = [
        req.body.razorpayPaymentId || null,
        req.user[0][0].rowid || null,
        entity || null,
        amountInRupees || null,
        currency || null,
        status || null,
        order_id || null,
        invoice_id || null,
        international || null,
        method || null,
        amount_refunded || null,
        refund_status || null,
        captured || null,
        description || null,
        card_id || null,
        bank || null,
        wallet || null,
        vpa || null,
        email || null,
        contact || null,
        notes && notes.address ? notes.address : null,
        feeInRupees || null,
        taxInRupees || null,
        error_code || null,
        error_description || null,
        error_source || null,
        error_step || null,
        error_reason || null,
        acquirer_data && acquirer_data.bank_transaction_id ? acquirer_data.bank_transaction_id : null,
        created_at ? new Date(created_at * 1000).toISOString().slice(0, 19).replace('T', ' ') : null,
        id,
        req.body.credits
      ];

      await dbConnection.query(query, values);

      let content = `
      <p>Thanks for choosing Gamalogic</p>
      <p>Your payment for ₹${Math.floor(req.body.cost)} for ${Number(req.body.credits).toLocaleString()} credits has been successfully processed.</p>
            `
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      updateLeadStatus(req.user[0][0].emailid)
      let purchaseDetailsForZohoBooks = {
        rate: amountInRupees,
        credits: req.body.credits,
        methord: 'Pay as you go',
        currency: process.env.BOOKS_INR_CURRENCY
      }
      try {
        let zohoBook = await ZohoBooks(req.user[0][0], purchaseDetailsForZohoBooks)
        if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1,id_zoho_books='${zohoBook.zohoBookContactId}' WHERE emailid='${req.user[0][0].emailid}'`)

        }
        else {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)

        }
      } catch (error) {
        await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)
      }

      if (req.user[0][0].is_referer_by == 1) {
        try {
          let DollarRate = await InrToUsdConverter(req.body.credits)
          let resp = await PurchaseApi(req.user[0][0].emailid, DollarRate, order_id || null, req.user[0][0]?.rowid ?? null)
          console.log(resp, 'resppppppp')
        } catch (error) {
          ErrorHandler("PayPalUpdateCredit Controller Thrive purchase push section", error, req);
        }
      }
      const currentTime = new Date().toISOString();
      await dbConnection.query(
        `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user[0][0].rowid, // userid
          "Payment Successful", // header
          `Your payment for ₹${Math.floor(req.body.cost)} for ${Number(
            req.body.credits
          ).toLocaleString()} credits has been successfully processed.`,
          currentTime,
          0,
          "payment",
        ]
      );

      const socketId = activeUsers.get(req.user[0][0].rowid,);
      if (socketId) {
        console.log('inside progress');
        io.to(socketId).emit("progress", {
          header: "Payment Successful",
          content: `Your payment for ₹${Math.floor(req.body.cost)} for ${Number(
            req.body.credits
          ).toLocaleString()} credits has been successfully processed.`,
          time: currentTime
        });
      }
      dbConnection.release()
      res.status(200).json('Successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("RazorPayUpdateCredit Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        try {
          await req.dbConnection.release();
        } catch (releaseError) {
          console.error('Error releasing database connection:', releaseError);
        }
      }
    }
  },
  razorPaySubscriptin: async (req, res) => {
    try {
      const { credits, period } = req.body.paymentDetails;

      if (typeof credits !== 'number' || typeof period !== 'string') {
        throw new Error('Invalid payment details');
      }

      const planid = RazorpayPrice.find(([planCredits, id, planPeriod]) => {
        if (period === 'monthly') {
          return credits === planCredits && period === planPeriod;
        } else {
          // For annual plans, check against credits multiplied by 12
          // console.log('its reaching here')
          return credits * 12 === planCredits && period === planPeriod;
        }
      });

      if (!planid) {
        throw new Error('Plan not found');
      }

      let instance = new Razorpay(
        {
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_SECRET
        }
      );
      const options = {
        plan_id: planid[1],
        customer_notify: 1,
        // start_at: Math.floor(Date.now() / 1000) + 60,
        total_count: period == 'monthly' ? 50 : 4,
      };
      console.log(options, 'optionssssssss')
      const subscription = await instance.subscriptions.create(options);
      res.json(subscription);
    } catch (error) {
      console.log(error, 'error adich mooone')
      res.status(500).send(error);
    }
    finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  razorPaySubscriptionSuccess: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits from registration WHERE emailid='${req.user[0][0].emailid}'`)

      let newBalance = user[0][0].credits + req.body.credits

      var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET })
      let resp = await instance.payments.fetch(req.body.razorpayPaymentId)
      let subscriptinDetails = await instance.subscriptions.fetch(req.body.razorpaySubscriptionId)

      if (!resp) {
        console.log('error fetching response  ')
        return res.status(500).json({ error: 'Error fetching payment response' });
      }

      const periodColumn = req.body.paymentDetails.period === 'monthly' ? 'is_monthly' : 'is_annual';


      let DollarRate = await InrToUsdSubscriptionConverter(req.body.credits, periodColumn)
      const query = `
    INSERT INTO razorpay_subscription (id, amount,fee,tax, order_id, method, amount_refunded, refund_status, description, card_id, bank, wallet, vpa, email, contact, token_id, notes_address, rrn, upi_transaction_id, created_at, upi_vpa, entity, plan_id, customer_id, status,subscription_id,timestamp,${periodColumn},amount_usd,credits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)
  `;
      let amount = resp.amount / 100
      let fee = Math.round(resp.fee / 100)
      let tax = resp.tax / 100
      const values = [
        resp.id || null,
        amount || null,
        fee || null,
        tax || null,
        resp.order_id || null,
        resp.method || null,
        resp.amount_refunded || null,
        resp.refund_status || null,
        resp.description || null,
        resp.card_id || null,
        resp.bank || null,
        resp.wallet || null,
        resp.vpa || null,
        resp.email || null,
        resp.contact || null,
        resp.token_id || null,
        resp.notes?.address || null,
        resp.acquirer_data?.rrn || null,
        resp.acquirer_data?.upi_transaction_id || null,
        new Date(subscriptinDetails.created_at * 1000).toISOString() || null,
        resp.upi?.vpa || null,
        subscriptinDetails.entity || null,
        subscriptinDetails.plan_id || null,
        req.user[0][0].rowid,
        subscriptinDetails.status || null,
        subscriptinDetails.id || null,
        new Date().toISOString(),
        1,
        DollarRate,
        req.body.credits
      ]

      await dbConnection.query(query, values);
      if (req.user[0][0].is_referer_by == 1) {
        try {
          let response = await PurchaseApi(req.user[0][0].emailid, DollarRate, resp.order_id || null, req.user[0][0]?.rowid ?? null)
          console.log(response, 'resppppppp')
        } catch (error) {
          ErrorHandler("PayPalUpdateCredit Controller Thrive purchase push section", error, req);
        }
      }
      let content
      if (req.body.paymentDetails.period == 'monthly') {
        content = `
        <p>Your payment of ₹ ${amount} for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits has been successfully processed. Additionally, we have activated your monthly subscription for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits.</p>
        
        <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
        `
      }
      else {
        content = `
        <p>We are pleased to inform you that your payment of ₹ ${amount} for the annual subscription has been successfully processed, and ${Number(req.body.paymentDetails.credits).toLocaleString()} credits have been added to your account for this month.</p>
        
        <p>If you have any questions or need further assistance regarding your payment or subscription, please don't hesitate to reach out to us.</p>
        `

      }
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      updateLeadStatus(req.user[0][0].emailid)
      const currentDate = new Date();
      let purchaseDetailsForZohoBooks = {
        rate: amount,
        credits: req.body.credits,
        methord: `${req.body.paymentDetails.period === 'monthly'
          ? `Monthly subscription of ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
          : `Annual subscription of ${currentDate.getFullYear()}`}`,
        currency: process.env.BOOKS_INR_CURRENCY
      }
      try {
        let zohoBook = await ZohoBooks(req.user[0][0], purchaseDetailsForZohoBooks)
        if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,${periodColumn} = 1,is_pay_as_you_go=0,subscription_start_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',
          last_payment_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',is_active=1,is_pay_as_you_go=0,subscription_stop_time=NULL,id_zoho_books='${zohoBook.zohoBookContactId}'
     WHERE emailid='${req.user[0][0].emailid}'`)
        } else {
          await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,${periodColumn} = 1,is_pay_as_you_go=0,subscription_start_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',
          last_payment_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',is_active=1,is_pay_as_you_go=0,subscription_stop_time=NULL
     WHERE emailid='${req.user[0][0].emailid}'`)
        }
      } catch (error) {
        await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,${periodColumn} = 1,is_pay_as_you_go=0,subscription_start_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',
        last_payment_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',is_active=1,is_pay_as_you_go=0,subscription_stop_time=NULL
   WHERE emailid='${req.user[0][0].emailid}'`)

      }
      const currentTime = new Date().toISOString();
      await dbConnection.query(
        `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user[0][0].rowid,
          "Subscription Payment Successful",
          `Your ${req.body.paymentDetails.period == 'monthly' ? 'monthly' : 'annual'} subscription payment of ₹${Number(Math.round(amount)).toLocaleString()} for ${Number(req.body.credits).toLocaleString()} credits has been successfully processed.`,
          currentTime,
          0,
          "subscription",
        ]
      );

      const socketId = activeUsers.get(req.user[0][0].rowid);
      if (socketId) {
        console.log('inside progress');
        io.to(socketId).emit("progress", {
          header: "Subscription Payment Successful",
          content: `Your ${req.body.paymentDetails.period == 'monthly' ? 'monthly' : 'annual'} subscription payment of $${Number(Math.round(amount)).toLocaleString()} for ${Number(req.body.credits).toLocaleString()} credits has been successfully processed.`,
          time: currentTime
        });
      }
      res.status(200).json('Successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("RazorPaySubscriptionUpdateCredit Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        try {
          await req.dbConnection.release();
        } catch (releaseError) {
          console.error('Error releasing database connection:', releaseError);
        }
      }
    }
  },
  razorPayWebhook: async (req, res) => {
    // ErrorHandler("RazorPayWebhook checker 11111", req.body, req);
    try {
      const dbConnection = req.dbConnection;
      const event = req.body.event;
      const payload = req.body.payload;
      let subId = payload?.subscription?.entity?.id

      let subscriptionDetails = await dbConnection.query(`SELECT * FROM razorpay_subscription Where subscription_id='${subId}'ORDER BY glid DESC 
          LIMIT 1`)
      if (subscriptionDetails[0].length > 0) {
        let userDetails = await dbConnection.query(`SELECT * FROM registration WHERE rowid='${subscriptionDetails[0][0].customer_id}'`)
        if (userDetails.length === 0 || !userDetails[0][0]) {
          console.error('No user details found for the given customer_id.');
          return res.status(404).json({ error: 'User not found.' });
        }
        let planDetails = RazorpayPrice.find(([credit, id, period]) => id == subscriptionDetails[0][0].plan_id)
        console.log(planDetails, 'plan details')

        if (event === 'subscription.charged') {
          const chargeDate = new Date(subscriptionDetails[0][0].timestamp).toISOString().split('T')[0];
          const today = new Date().toISOString().split('T')[0];
          const dateMatch = chargeDate != today;
          console.log(today, chargeDate, 'date of db and now')
          console.log(dateMatch, 'date match')


          if (dateMatch) {
            let newBalance = userDetails[0][0].credits + (planDetails[2] == 'monthly' ? planDetails[0] : planDetails[0] / 12);

            let paymentId = payload?.payment?.entity?.id
            console.log(paymentId, 'payement id')

            var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET })
            let resp = await instance.payments.fetch(paymentId)
            console.log(resp, 'resppp')

            let subscriptinDetails = await instance.subscriptions.fetch(subId)
            console.log(subscriptinDetails, 'subbbbbb detailssss')

            if (!resp) {
              console.log('error fetching response  ')
              return res.status(500).json({ error: 'Error fetching payment response' });
            }
            let last_payment = new Date().toISOString()
            let content
            let creditToConvert
            if (planDetails[2] === 'monthly' || planDetails[2] === 'is_monthly') {
              creditToConvert = planDetails[0];
            } else {
              creditToConvert = planDetails[0] / 12;
            }
            let DollarRateForDB = await InrToUsdSubscriptionConverter(creditToConvert, planDetails[2])


            let amount = resp.amount / 100
            let fee = Math.round(resp.fee / 100)
            let tax = resp.tax / 100
            const query = `
          INSERT INTO razorpay_subscription (id, amount,fee,tax, order_id, method, amount_refunded, refund_status, description, card_id, bank, wallet, vpa, email, contact, token_id, notes_address, rrn, upi_transaction_id, created_at, upi_vpa, entity, plan_id, customer_id, status,subscription_id,timestamp,amount_usd,credits)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)
        `;

            const values = [
              resp.id || null,
              amount || null,
              fee || null,
              tax || null,
              resp.order_id || null,
              resp.method || null,
              resp.amount_refunded || null,
              resp.refund_status || null,
              resp.description || null,
              resp.card_id || null,
              resp.bank || null,
              resp.wallet || null,
              resp.vpa || null,
              resp.email || null,
              resp.contact || null,
              resp.token_id || null,
              resp.notes?.address || null,
              resp.acquirer_data?.rrn || null,
              resp.acquirer_data?.upi_transaction_id || null,
              new Date(subscriptinDetails.created_at * 1000).toISOString() || null,
              resp.upi?.vpa || null,
              subscriptinDetails.entity || null,
              subscriptinDetails.plan_id || null,
              userDetails[0][0].rowid,
              subscriptinDetails.status || null,
              subscriptinDetails.id || null,
              new Date().toISOString(),
              DollarRateForDB,
              planDetails[2] == 'monthly' ? planDetails[0] : planDetails[0] / 12,

            ]

            await dbConnection.query(query, values);
            const currentDate = new Date();
            let purchaseDetailsForZohoBooks = {
              rate: amount,
              credits: planDetails[2] == 'monthly' ? planDetails[0] : planDetails[0] / 12,
              methord: `${planDetails[2] == 'monthly'
                ? `Monthly subscription of ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                : `Annual subscription of ${currentDate.getFullYear()}`}`,
              currency: process.env.BOOKS_INR_CURRENCY
            }
            try {
              let zohoBook = await ZohoBooks(userDetails[0][0], purchaseDetailsForZohoBooks)
              if (zohoBook?.zohoBookContactId && zohoBook?.changeInDb) {
                await dbConnection.query(`UPDATE registration SET credits = '${newBalance}',last_payment_time='${last_payment}',id_zoho_books='${zohoBook.zohoBookContactId}' WHERE rowid = '${subscriptionDetails[0][0].customer_id}'`);

              } else {
                await dbConnection.query(`UPDATE registration SET credits = '${newBalance}',last_payment_time='${last_payment}' WHERE rowid = '${subscriptionDetails[0][0].customer_id}'`);

              }

            } catch (error) {
              await dbConnection.query(`UPDATE registration SET credits = '${newBalance}',last_payment_time='${last_payment}' WHERE rowid = '${subscriptionDetails[0][0].customer_id}'`);

            }
            if (userDetails[0][0].is_referer_by == 1) {
              try {
                let DollarRate = await InrToUsdSubscriptionConverter(creditToConvert, planDetails[2])
                console.log(DollarRate, 'rate in dollar ')
                let response = await PurchaseApi(userDetails[0][0].emailid, DollarRate, resp.order_id || null, userDetails[0][0]?.rowid ?? null)
                console.log(response, 'resppppppp')
              } catch (error) {
                ErrorHandler("razorpay webhook Controller Thrive purchase push section", error, req);
              }
            }
            if (planDetails[2] == 'monthly') {
              content = `
            <p>Your subscription has been renewed successfully. We have processed your payment of ₹${Number(Math.round(amount)).toLocaleString()} for ${Number(planDetails[0]).toLocaleString()} credits has been successfully processed.</p>
            
            <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
            `
            }
            else {
              content = `
            <p>Your subscription has been renewed successfully. We have processed your payment of ₹${Number(Math.round(amount)).toLocaleString()} for ${Number(planDetails[0]).toLocaleString()} credits has been successfully processed.</p>
            
            <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
            `
            }
            let isMonthlyInEmail = planDetails[2] == 'monthly' ? 'Monthly' : 'Annual'
            sendEmail(
              userDetails[0][0].username,
              userDetails[0][0].emailid,
              `Gamalogic ${isMonthlyInEmail} Subscription Payment successful`,
              basicTemplate(userDetails[0][0].username, content)
            );

            const currentTime = new Date().toISOString();
            await dbConnection.query(
              `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                userDetails[0][0].rowid,
                "Subscription Payment Successful",
                `Your ${planDetails[2] == 'monthly' ? 'monthly' : 'annual'} subscription payment of ₹${Number(Math.round(amount)).toLocaleString()} for ${Number(planDetails[0]).toLocaleString()} credits has been successfully processed.`,
                currentTime,
                0,
                "subscription",
              ]
            );

            const socketId = activeUsers.get(userDetails[0][0].rowid);
            if (socketId) {
              console.log('inside progress');
              io.to(socketId).emit("progress", {
                header: "Subscription Payment Successful",
                content: `Your ${planDetails[2] == 'monthly' ? 'monthly' : 'annual'} subscription payment of ₹${Number(Math.round(amount)).toLocaleString()} for ${Number(planDetails[0]).toLocaleString()} credits has been successfully processed.`,
                time: currentTime,
              });
            }

          }
          else {
            console.log('date is match so updation is not needed')
          }

          // const existingEntryCreationDate = new Date(subscriptionDetails[0][0].start_time).toISOString().split('T')[0]; // Extract date part

        }
        else if (event === 'subscription.cancelled') {
          let isMonthlyInEmail = planDetails[2] == 'monthly' ? 'Monthly' : 'Annual'
          let content
          if (isMonthlyInEmail) {
            content = `
        <p>We're sorry to see you go! Your monthly subscription has been successfully cancelled.</p>
        
        <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>

        <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
        `
          } else {
            content = `
        <p>We're sorry to see you go! Your annual subscription has been successfully cancelled.</p>
        
        <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>

        <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
        `
          }
          sendEmail(
            userDetails[0][0].username,
            userDetails[0][0].emailid,
            `Gamalogic ${isMonthlyInEmail} Subscription Cancellation`,
            basicTemplate(userDetails[0][0].username, content)
          );
          let stopTime = new Date().toISOString()

          await dbConnection.query(
            `UPDATE registration SET is_active=0, subscription_stop_time = ? WHERE rowid = ?`,
            [stopTime, userDetails[0][0].rowid]
          );

          const currentTime = new Date().toISOString();
          await dbConnection.query(
            `INSERT INTO notification (userid, header, content, time, isRead, type) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              userDetails[0][0].rowid,
              "Subscription Cancelled",
              `Your ${isMonthlyInEmail} subscription has been successfully cancelled.`,
              currentTime,
              0,
              "subscription",
            ]
          );

          const socketId = activeUsers.get(userDetails[0][0].rowid);
          if (socketId) {
            console.log('inside progress');
            io.to(socketId).emit("progress", {
              header: "Subscription Cancelled",
              content: `Your ${isMonthlyInEmail} subscription has been successfully cancelled.`,
              time: currentTime,
            });
          }
          console.log('subscription cancelled succesfully.............')
        }
      }
      res.status(200).send('Webhook processed successfully');

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" });

    } finally {
      if (req.dbConnection) {
        try {
          await req.dbConnection.release();
        } catch (releaseError) {
          console.error('Error releasing database connection:', releaseError);
        }
      }
    }
  },
  loyalityWebhook: async (req, res) => {
    try {
      let dbConnection = req.dbConnection
      if (!req.body.zt_email) {
        return res.status(400).json({ error: 'Required fields zt_email is missing' });
      }
      const userEmail = req.body.zt_email;
      const [users] = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid = ?`,
        [userEmail]
      );
      if (users.length > 0) {
        const user = users[0];
        const creditValue = req.body.zt_value
        let newCreditBal
        let newFreeFinal = null;

        let finalFreeDate = new Date(user.free_final);
        let currentDate = new Date();

        if (user.credits_free > 0 && finalFreeDate >= currentDate) {
          newCreditBal = user.credits_free + creditValue
          finalFreeDate.setDate(finalFreeDate.getDate() + 7);
          newFreeFinal = finalFreeDate.toISOString().slice(0, 19).replace('T', ' ');
        } else if (user.credits_free > 0 && finalFreeDate < currentDate) {
          newCreditBal = creditValue

          const newDate = new Date();
          newDate.setDate(newDate.getDate() + 7);
          newFreeFinal = newDate.toISOString().slice(0, 19).replace('T', ' ');
        } else if (user.credits_free <= 0 && finalFreeDate >= currentDate) {
          newCreditBal = creditValue
          finalFreeDate.setDate(finalFreeDate.getDate() + 7);
          newFreeFinal = finalFreeDate.toISOString().slice(0, 19).replace('T', ' ');
        }
        await dbConnection.query(
          `UPDATE registration SET credits_free = ?,free_final=? WHERE emailid = ?`,
          [newCreditBal, newFreeFinal, userEmail]
        );
        return res.status(200).json({ message: 'Credits updated successfully' });
      }
      else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error in loyalityWebhook:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  getPlanDetails: async (req, res) => {
    const dbConnection = req.dbConnection;
    try {
      // console.log(req.user[0][0], 'user is hereeeee');
      console.log('check 1')
      let planDetails;
      if (req.user[0][0].is_premium == 1 && (req.user[0][0].is_monthly == 1 || req.user[0][0].is_annual == 1)) {
        let paypalSub = await dbConnection.query(`
            SELECT * FROM paypal_subscription 
            WHERE userid='${req.user[0][0].rowid}' 
            ORDER BY id DESC
          `);

        let razorPaySub = await dbConnection.query(`
            SELECT * FROM razorpay_subscription 
            WHERE customer_id='${req.user[0][0].rowid}' 
            ORDER BY glid DESC
          `);
        if (paypalSub[0].length === 0 && razorPaySub[0].length > 0) {
          planDetails = {
            ...razorPaySub[0][0],
            source: 'razorpay',
            credits: razorPaySub[0][0].credits || null,
            gross_amount: razorPaySub[0][0].amount_usd || null
          };
        }
        else if (razorPaySub[0].length === 0 && paypalSub[0].length > 0) {
          planDetails = {
            ...paypalSub[0][0],
            source: 'paypal'
          };
        }
        else if (razorPaySub[0].length > 0 && paypalSub[0].length > 0) {
          if (new Date(razorPaySub[0][0].timestamp).getTime() > new Date(paypalSub[0][0].time_stamp).getTime()) {
            planDetails = {
              ...razorPaySub[0][0],
              source: 'razorpay',
              credits: razorPaySub[0][0].credits || null,
              gross_amount: razorPaySub[0][0].amount_usd || null
            };
          } else {
            planDetails = {
              ...paypalSub[0][0],
              source: 'paypal'
            };
          }
        }
        else {
          planDetails = null;
        }
      }

      let userDetails = {
        isPremium: req.user[0][0].is_premium,
        isPayAsYouGo: req.user[0][0].is_pay_as_you_go,
        isMonthly: req.user[0][0].is_monthly,
        isAnnual: req.user[0][0].is_annual,
        freeTrialExpiry: req.user[0][0].free_final,
        isActive: req.user[0][0].is_active,
        credits: req.user[0][0].credits,
        freeCredits: req.user[0][0].credits_free,
        subStopTime: req.user[0][0].subscription_stop_time,
        planDetails: planDetails
      };

      // console.log(userDetails, 'user details to pass ')
      console.log('check last')
      res.status(200).json(userDetails);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error fetching plan details' });
    }
    finally {
      if (dbConnection) {
        await dbConnection.release();
      }
    }
  },
  affilateUserId: async (req, res) => {
    // const dbConnection = req.dbConnection;
    // const token = req.headers.authorization;
    // if (token) {
    try {
      console.log(req.user[0][0], 'body of ztuser')
      let email_id = req.user[0][0].emailid
      let customer_id = req.user[0][0].rowid
      let digestRaw = email_id + customer_id
      let algorithm = "sha256"
      let secret = "91527c80d95b01f901a87e28cdece52d";
      let HMACDigest = crypto.createHmac(algorithm, secret).update(digestRaw).digest("hex")
      console.log(HMACDigest, 'hmdigest')
      res.status(200).json({ user: req.user[0][0], HMACDigest })
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
      console.log(error)
    }

    // }
  },
};
export default APIControllers;
