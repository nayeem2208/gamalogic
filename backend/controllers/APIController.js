import axios from "axios";
// import dbConnection from "../config/RemoteDb.js";
import generateUniqueApiKey from "../utils/generatePassword.js";
import ErrorHandler from "../utils/errorHandler.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";
import sendEmail from "../utils/zeptoMail.js";

let APIControllers = {
  getCreditBalance: async (req, res) => {
    try {
      let creditBal;
      let finalFree = new Date(req.user[0][0].free_final);
      let finalFreeDate = new Date(finalFree);
      let currentDate = new Date();
      if (req.user[0][0].credits_free > 0 && finalFreeDate > currentDate) {
        creditBal = req.user[0][0].credits_free + req.user[0][0].credits
      } else {
        creditBal = req.user[0][0].credits;
      }
      res.status(200).json(creditBal)
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      // ErrorHandler("getApi Controller", error, req);
      res.status(400).json(error);
    }
    finally {
      console.log('credit bal api')
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }
  },
  getApi: async (req, res) => {
    try {
      res.status(200).json({ apiKey: req.user[0][0].api_key });
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("getApi Controller", error, req);
      res.status(400).json(error);
    } finally {
      console.log('getApi end')
      if (req.dbConnection) {
        await req.dbConnection.end();
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
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("resetApiKey Controller", error, req);
      res.status(400).json(error);
    } finally {
      console.log('getApi end')
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  emailValidation: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let validate = await axios.get(
        `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      res.status(200).json(validate.data.gamalogic_emailid_vrfy[0]);
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("emailValidation Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  FindSingleEmail: async (req, res) => {
    try {
      let nameArray = req.body.fullname.split(" ");
      let firstname = nameArray[0];
      let lastname = nameArray[nameArray.length - 1];
      let apiKey = req.user[0][0].api_key;
      let find = await axios.get(
        `https://gamalogic.com/email-discovery/?firstname=${firstname}&lastname=${lastname}&domain=${req.body.domain}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      res.status(200).json(find.data);
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("FindSingleEmail Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  changePassword: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let { old, newPassword, confirm } = req.body;
      const hashedPassword = req.user[0][0].password;
      let passwordMatch = await verifyPassword(old, hashedPassword);
      if (!passwordMatch) {
        res.status(400).json({ message: "Previous password is invalid" });
      } else {
        let hashedPasswordForDatabase = await passwordHash(newPassword);
        await dbConnection.query(
          `UPDATE registration SET password='${hashedPasswordForDatabase}' WHERE emailid='${req.user[0][0].emailid}'`
        );
        sendEmail(
          req.user[0][0].username,
          req.user[0][0].emailid,
          "Password successfully updated",
          `<p>Hi ${req.user[0][0].username},</p>

          <p>Your password has been successfully updated.</p>
          
          <p>If you did not initiate this action, please contact us immediately.</p>
          
          <p>Best regards,</p>
            <p>Gamalogic</p>
          `
        );
        res.status(200).json({ message: "Password successfully changed" });
      }
      await dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("changePassword Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  getAlreadyCheckedBatchEmailFiles: async (req, res) => {
    let dbConnection;
    try {
      dbConnection = req.dbConnection;
      let files = await dbConnection.query(
        `SELECT * FROM useractivity_batch_link WHERE userid='${req.user[0][0].rowid}' ORDER BY date_time DESC`
      );
      res.status(200).json(files[0]);
      await dbConnection.end()
    } catch (error) {
      console.error(error);
      ErrorHandler("getAlreadyCheckedBatchEmailFiles Controller", error, req);
      res.status(400).json(error);
    }
    finally {
      if (dbConnection) {
        try {
          await dbConnection.end();
        } catch (endError) {
          console.error("Error closing database connection:", endError);
        }
      }
    }
  },

  batchEmailValidation: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let apiKey = req.user[0][0].api_key;
      const { emails, fileName } = req.body;
      const data = {
        gamalogic_emailid_vrfy: emails,
      };
      let response = await axios.post(
        `https://gamalogic.com/batchemailvrf?apikey=${process.env.API_KEY}&speed_rank=0`,
        data
      );
      if (response.data.error !== undefined && response.data.error == false) {
        let currenttime = new Date();
        const formattedDate = currenttime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const userAgent = req.headers["user-agent"];
        const ip = req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress || '';
        let fileAdded = await dbConnection.query(
          `INSERT INTO useractivity_batch_link(id,userid,apikey,date_time,speed_rank,count,ip_address,user_agent,file,file_upload,is_api,is_api_file,is_dashboard)VALUES('${response.data["batch id"]}','${req.user[0][0].rowid}','${process.env.API_KEY}','${formattedDate}',0,'${response.data["total count"]}','${ip}','${userAgent}','${fileName}','${fileName}',1,0,0)`
        );
        let files = await dbConnection.query(`SELECT * FROM useractivity_batch_link where id='${response.data["batch id"]}'`)
        sendEmail(
          req.user[0][0].username,
          req.user[0][0].emailid,
          "Bulk Email Verification Started",
          `<p>Hi ${req.user[0][0].username},</p>
          <p>This is to inform you that the bulk email verification process for the file you uploaded has been started.</p>
          <p>Please note that the verification process may take some time depending on the size of the file and the number of emails to be verified.</p>
          <p>Thank you for using our service.</p>
          <p>Best regards,</p>
          <p>Gamalogic</p>`
        );
        res.status(200).json({ message: response.data.message, files: files[0][0] });
        await dbConnection.end()
      } else {
        const errorMessage = Object.values(response.data)[0];
        res.status(400).json({ error: errorMessage });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("batchEmailValidation Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  batchEmailStatus: async (req, res) => {
    try {
      let apiKey = req.user.api_key;
      let emailStatus = await axios.get(
        `https://gamalogic.com/batchstatus/?apikey=${process.env.API_KEY}&batchid=${req.query.id}`
      );
      res.status(200).json({ emailStatus: emailStatus.data })
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(400).json(error);
    }
    // finally {
    //   if (req.dbConnection) {
    //     await req.dbConnection.end();
    //   }
    // }

  },
  downloadEmailVerificationFile: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batchresult/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      res.status(200).json(download.data);
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailVerificationFile Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },


  getAlreadyCheckedBatchEmailFinderFiles: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where userid='${req.user[0][0].rowid}' ORDER BY date_time DESC`)
      res.status(200).json(files[0])
      await dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("getAlreadyCheckedBatchEmailFinderFiles Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  batchEmailFinder: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let apiKey = req.user[0][0].api_key;
      const data = {
        gamalogic_emailid_finder: req.body.data,
      };
      let response = await axios.post(
        `https://gamalogic.com/batch-email-discovery/?apikey=${process.env.API_KEY}`,
        data
      );
      if (response.data.error !== undefined && response.data.error == false) {
        let currenttime = new Date();
        const formattedDate = currenttime
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const userAgent = req.headers["user-agent"];
        const ip = req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress || '';
        let fileAdded = await dbConnection.query(
          `INSERT INTO useractivity_batch_finder_link(id,userid,apikey,date_time,speed_rank,count,ip_address,user_agent,file,file_upload,is_api,is_api_file,is_dashboard)VALUES('${response.data["batch id"]}','${req.user[0][0].rowid}','${process.env.API_KEY}','${formattedDate}',0,'${response.data["total count"]}','${ip}','${userAgent}','${req.body.fileName}','${req.body.fileName}',1,0,0)`
        );
        let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where id='${response.data["batch id"]}'`)
        res.status(200).json({ message: response.data.message, files: files[0][0] });
      }
      else {
        const errorMessage = Object.values(response.data)[0];
        console.log(errorMessage, 'errorMessage')
        res.status(400).json({ error: errorMessage });
      }
      await dbConnection.end()
    } catch (error) {
      console.log(error)
      res.status(400).json(error)
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  batchEmailFinderStatus: async (req, res) => {
    try {
      let apiKey = req.user.api_key;
      let emailStatus = await axios.get(
        `https://gamalogic.com/batch-email-discovery-status/?apikey=${process.env.API_KEY}&batchid=${req.query.id}`
      );
      res.status(200).json({ emailStatus: emailStatus.data });
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(400).json(error);
    }

  },
  downloadEmailFinderResultFile: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batch-email-discovery-result/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      res.status(200).json(download.data);
      await req.dbConnection.end();
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailVerificationFile Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },

  updateCredit: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let credit = await dbConnection.query(`SELECT credits from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let newBalance = credit[0][0].credits + req.body.credits
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}' WHERE emailid='${req.user[0][0].emailid}'`)
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        `<p>Hi ${req.user[0][0].username},</p>

        <p>Your payment for ${req.body.cost} has been successfully processed.</p>
        
        <p>If you have any questions or concerns regarding this payment, please feel free to contact us.</p>
        
        <p>Best regards,</p>
          <p>Gamalogic</p>
        `
      );
      res.status(200).json('Successfull')
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("updateCredit Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  creditFailureEmail:async(req,res)=>{
    try {
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment Unsuccessful",
        `<p>Hi ${req.user[0][0].username},</p>
        <p>We regret to inform you that your payment for ${req.body.cost} was unsuccessful.</p>
        <p>If you have any questions or concerns regarding this issue, please feel free to contact us.</p>
        <p>Best regards,</p>
        <p>Gamalogic</p>`
    );  
    
    res.status(200)
    } catch (error) {
      console.log(error);
      ErrorHandler("creditFailureEmail Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }
  }
};
export default APIControllers;
