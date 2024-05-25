import axios from "axios";
// import dbConnection from "../config/RemoteDb.js";
import generateUniqueApiKey from "../utils/generatePassword.js";
import ErrorHandler from "../utils/errorHandler.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";
import sendEmail from "../utils/zeptoMail.js";
import basicTemplate from "../EmailTemplates/BasicTemplate.js";

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
    } catch (error) {
      console.log(error);
      // ErrorHandler("getApi Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  getApi: async (req, res) => {
    try {
      if (req.user[0][0].api_key) {
        res.status(200).json({ apiKey: req.user[0][0].api_key });
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
      console.log('getApi end')
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  emailValidation: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let validate = await axios.get(
        `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      let finalFree = new Date(req.user[0][0].free_final);
      let finalFreeDate = new Date(finalFree);
      let currentDate = new Date();
      if (req.user[0][0].credits_free > 0 && finalFreeDate > currentDate) {
        await req.dbConnection.query(
          `UPDATE registration 
         SET credits_free = credits_free - 1 
         WHERE rowid = '${req.user[0][0].rowid}'`
        );
      }
      else if (req.user[0][0].credits > 0) {
        await req.dbConnection.query(
          `UPDATE registration 
         SET credits = credits - 1 
         WHERE rowid = '${req.user[0][0].rowid}'`
        );
      }
      res.status(200).json(validate.data.gamalogic_emailid_vrfy[0]);
    } catch (error) {
      console.log(error);
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
      let nameArray = req.body.fullname.split(" ");
      let firstname = nameArray[0];
      let lastname = nameArray[nameArray.length - 1];
      let apiKey = req.user[0][0].api_key;
      let find = await axios.get(
        `https://gamalogic.com/email-discovery/?firstname=${firstname}&lastname=${lastname}&domain=${req.body.domain}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      let finalFree = new Date(req.user[0][0].free_final);
      let finalFreeDate = new Date(finalFree);
      let currentDate = new Date();
      if (req.user[0][0].credits_free >= 10 && finalFreeDate > currentDate) {
        await req.dbConnection.query(
          `UPDATE registration 
         SET credits_free = credits_free - 10 
         WHERE rowid = '${req.user[0][0].rowid}'`
        );
      }
      else if (req.user[0][0].credits >= 10) {
        await req.dbConnection.query(
          `UPDATE registration 
         SET credits = credits - 10 
         WHERE rowid = '${req.user[0][0].rowid}'`
        );
      }
      res.status(200).json(find.data);
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
          
        <p>If you did not initiate this action, please contact us immediately.</p>`
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
      let files = await dbConnection.query(
        `SELECT * FROM useractivity_batch_link WHERE userid='${req.user[0][0].rowid}' ORDER BY date_time DESC LIMIT 5 OFFSET ${(req.query.page- 1) * 5};`
      );
      res.status(200).json(files[0]);
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
      const dbConnection = req.dbConnection;
      let apiKey = req.user[0][0].api_key;
      const { emails, fileName } = req.body;
      let finalFreeDate = new Date(req.user[0][0].free_final);
      let currentDate = new Date();
      if ((req.user[0][0].credits + req.user[0][0].credits_free >= emails.length && finalFreeDate > currentDate) || (req.user[0][0].credits >= emails.length)) {
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
          let content = `<p>This is to inform you that the bulk email verification process for the file ${fileName} has been started.</p>
        <p>Please note that the verification process may take some time depending on the size of the file and the number of emails to be verified.</p>
        <p>Thank you for using our service.</p>
        <div class="verify">
        <a href="https://beta.gamalogic.com/dashboard/file-upload"><button
                class="verifyButton">Download</button></a>

        </div>`
          sendEmail(
            req.user[0][0].username,
            req.user[0][0].emailid,
            "Bulk Email Verification Started",
            basicTemplate(req.user[0][0].username, content)
          );
          if (req.user[0][0].credits_free >= emails.length && finalFreeDate > currentDate) {
            await dbConnection.query(
              `UPDATE registration 
         SET credits_free = credits_free - ${emails.length} 
         WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          else if (req.user[0][0].credits_free > 0 && finalFreeDate > currentDate && emails.length > req.user[0][0].credits_free) {
            const remainingCreditsToSubtract = emails.length - req.user[0][0].credits_free;

            await dbConnection.query(
              `UPDATE users 
     SET credits = credits - ${remainingCreditsToSubtract}, 
         credits_free = 0 
     WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          else if (req.user[0][0].credits >= emails.length) {
            await dbConnection.query(
              `UPDATE registration 
         SET credits = credits - ${emails.length} 
         WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          res.status(200).json({ message: response.data.message, files: files[0][0] });
        } else {
          const errorMessage = Object.values(response.data)[0];
          res.status(400).json({ error: errorMessage });
        }
      } else {
        res.status(400).json({ error: 'You dont have enough to do this' });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("batchEmailValidation Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
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
      res.status(500).json({ error: "Internal Server Error" });
    }
    // finally {
    //   if (req.dbConnection) {
    //     await req.dbConnection.release();
    //   }
    // }

  },
  downloadEmailVerificationFile: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batchresult/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      let fileName=await req.dbConnection.query(`SELECT file from useractivity_batch_link where id='${req.query.batchId}'`)
      res.status(200).json({datas:download.data,fileName:fileName[0][0].file});
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


  getAlreadyCheckedBatchEmailFinderFiles: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where userid='${req.user[0][0].rowid}' ORDER BY date_time DESC`)
      res.status(200).json(files[0])
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
      let apiKey = req.user[0][0].api_key;
      let finalFreeDate = new Date(req.user[0][0].free_final);
      let currentDate = new Date();
      //checking that we have enough credits to do this 
      if ((req.user[0][0].credits + req.user[0][0].credits_free >= (req.body.data.length * 10) && finalFreeDate > currentDate) || (req.user[0][0].credits >= req.body.data.length * 10)) {
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
          let content = `<p>This is to inform you that the bulk email finder process for the file ${req.body.fileName} has been started.</p>
        <p>Please note that the finding process may take some time depending on the size of the file and the number of emails to be find.</p>
        <p>Thank you for using our service.</p>
        <div class="verify">
        <a href="https://beta.gamalogic.com/dashboard/file-upload-finder"><button
                class="verifyButton">Download</button></a>

        </div>`
          //sending email when finding process started 
          sendEmail(
            req.user[0][0].username,
            req.user[0][0].emailid,
            "Bulk Email Finder Started",
            basicTemplate(req.user[0][0].username, content)
          );
          //decreasing the credit amout based on length of data
          if (req.user[0][0].credits_free >= (req.body.data.length * 10) && finalFreeDate > currentDate) {
            let val = req.body.data.length * 10
            //to decrease from credits_free
            await dbConnection.query(
              `UPDATE registration 
         SET credits_free = credits_free - ${val} 
         WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          else if (req.user[0][0].credits_free > 0 && finalFreeDate > currentDate && (req.body.data.length * 10) > req.user[0][0].credits_free) {
            //to decrease from both credits_free and credits 
            const remainingCreditsToSubtract = req.body.data.length * 10 - req.user[0][0].credits_free;

            await dbConnection.query(
              `UPDATE users 
     SET credits = credits - ${remainingCreditsToSubtract}, 
         credits_free = 0 
     WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          else if (req.user[0][0].credits >= req.body.data.length * 10) {
            //to decrease from credits_free
            let val = req.body.data.length * 10
            await dbConnection.query(
              `UPDATE registration 
         SET credits = credits - ${val} 
         WHERE rowid = '${req.user[0][0].rowid}'`
            );
          }
          res.status(200).json({ message: response.data.message, files: files[0][0] });
        }
        else {
          const errorMessage = Object.values(response.data)[0];
          console.log(errorMessage, 'errorMessage')
          res.status(400).json({ error: errorMessage });
        }
      } else {
        res.status(400).json({ error: 'You dont have enough to do this' });
      }
    } catch (error) {
      console.log(error)
      res.status(400).json(error)
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
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
      res.status(500).json({ error: "Internal Server Error" });
    }

  },
  downloadEmailFinderResultFile: async (req, res) => {
    try {
      let apiKey = req.user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batch-email-discovery-result/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      let fileName=await req.dbConnection.query(`SELECT file from useractivity_batch_finder_link where id='${req.query.batchId}'`)
      res.status(200).json({datas:download.data,fileName:fileName[0][0].file});
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

  updateCredit: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let credit = await dbConnection.query(`SELECT credits from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let newBalance = credit[0][0].credits + req.body.credits
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}' WHERE emailid='${req.user[0][0].emailid}'`)
      let content = `
      <p>Your payment for ${req.body.cost} has been successfully processed.</p>
      
      <p>If you have any questions or concerns regarding this payment, please feel free to contact us.</p>
      `
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      res.status(200).json('Successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("updateCredit Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  creditFailureEmail: async (req, res) => {
    try {
      let content = ` <p>We regret to inform you that your payment for ${req.body.cost} was unsuccessful.</p>
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
      ErrorHandler("creditFailureEmail Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  }
};
export default APIControllers;
