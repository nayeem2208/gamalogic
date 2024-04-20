import axios from "axios";
import db from "../config/DB.js";
import generateUniqueApiKey from "../utils/generatePassword.js";
import ErrorHandler from "../utils/errorHandler.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";

let APIControllers = {
  getCreditBalance:async(req,res)=>{
    try {
      let credit=await db.query( `SELECT credits from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let creditBal=credit[0][0].credits
      res.status(200).json(creditBal)
    } catch (error) {
      console.log(error);
      // ErrorHandler("getApi Controller", error, req);
      res.status(400).json(error);
    }
  },
  getApi: async (req, res) => {
    try {
      let apiKey = await db.query(
        `SELECT api_key FROM registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      res.status(200).json({ apiKey: apiKey[0][0].api_key });
    } catch (error) {
      console.log(error);
      ErrorHandler("getApi Controller", error, req);
      res.status(400).json(error);
    }
  },
  resetApiKey: async (req, res) => {
    try {
      let newApiKey = await generateUniqueApiKey();
      console.log(newApiKey, "new api key ");
      let user = await db.query(
        `UPDATE registration SET api_key='${newApiKey}' WHERE emailid='${req.user[0][0].emailid}'`
      );
      console.log(user[0].affectedRows, "user");
      if (user[0].affectedRows === 1) {
        res.status(200).json({ newApiKey });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("resetApiKey Controller", error, req);
      res.status(400).json(error);
    }
  },
  emailValidation: async (req, res) => {
    try {
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      let validate = await axios.get(
        `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      res.status(200).json(validate.data.gamalogic_emailid_vrfy[0]);
    } catch (error) {
      console.log(error);
      ErrorHandler("emailValidation Controller", error, req);
      res.status(400).json(error);
    }
  },
  FindSingleEmail: async (req, res) => {
    try {
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let nameArray = req.body.fullname.split(" ");
      let firstname = nameArray[0];
      let lastname = nameArray[nameArray.length - 1];
      let apiKey = user[0][0].api_key;
      let find = await axios.get(
        `https://gamalogic.com/email-discovery/?firstname=${firstname}&lastname=${lastname}&domain=${req.body.domain}&apikey=${process.env.API_KEY}&speed_rank=0`
      );
      console.log(find.data, "find result");
      res.status(200).json(find.data);
    } catch (error) {
      console.log(error);
      ErrorHandler("FindSingleEmail Controller", error, req);
      res.status(400).json(error);
    }
  },
  changePassword: async (req, res) => {
    try {
      let { old, newPassword, confirm } = req.body;
      console.log(old, "old", newPassword, "new", confirm);
      let user = await db.query(
        `SELECT * from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      const hashedPassword = user[0][0].password;
      let passwordMatch = await verifyPassword(old, hashedPassword);
      if (!passwordMatch) {
        console.log("password match aayilla");
        res.status(400).json({ message: "Old password is not correct" });
      } else {
        let hashedPasswordForDatabase = await passwordHash(newPassword);
        console.log("ivda vare ok");
        await db.query(
          `UPDATE registration SET password='${hashedPasswordForDatabase}' WHERE emailid='${req.user[0][0].emailid}'`
        );
        console.log("add um aayi ");
        res.status(200).json({ message: "Password successfully changed" });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("changePassword Controller", error, req);
      res.status(400).json(error);
    }
  },
  getAlreadyCheckedBatchEmailFiles:async(req,res)=>{
    try {
      let user = await db.query(
        `SELECT * from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let files=await db.query(`SELECT * FROM useractivity_batch_link where userid='${user[0][0].rowid}'`)
      console.log(files[0],'files')
      res.status(200).json(files[0])
    } catch (error) {
      console.log(error);
      ErrorHandler("getAlreadyCheckedBatchEmailFiles Controller", error, req);
      res.status(400).json(error);
    }
  },
  batchEmailValidation: async (req, res) => {
    try {
      console.log(req.body.data,'req.body is here')
      let user = await db.query(
        `SELECT * from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      const data = {
        gamalogic_emailid_vrfy: req.body.data,
      };
      console.log(data)
      let response = await axios.post(
        `https://gamalogic.com/batchemailvrf?apikey=${process.env.API_KEY}&speed_rank=0`,
        data
      );
      console.log(response, "response is here ");

      let currenttime = new Date();
      const formattedDate = currenttime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;
      let fileAdded = await db.query(
        `INSERT INTO useractivity_batch_link(id,userid,apikey,date_time,speed_rank,count,ip_address,user_agent,file,file_upload,is_api,is_api_file,is_dashboard)VALUES('${response.data["batch id"]}','${user[0][0].rowid}','${apiKey}','${formattedDate}',0,'${response.data["total count"]}','${ip}','${userAgent}','${req.body.fileName}','${req.body.fileName}',1,0,0)`
      );
      let files=await db.query(`SELECT * FROM useractivity_batch_link where id='${response.data["batch id"]}'`)
        console.log(files[0],'fiels')
      res.status(200).json({message:response.data.message,files:files[0][0]});
    } catch (error) {
      console.log(error);
      ErrorHandler("batchEmailValidation Controller", error, req);
      res.status(400).json(error);
    }
  },
  batchEmailStatus: async (req, res) => {
    try {
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      let emailStatus = await axios.get(
        `https://gamalogic.com/batchstatus/?apikey=${process.env.API_KEY}&batchid=${req.query.id}`
      );
      console.log(emailStatus.data, "status");
      res.status(200).json({ emailStatus: emailStatus.data });
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(400).json(error);
    }
  },
  downloadEmailVerificationFile: async (req, res) => {
    try {
      console.log(req.query.batchId, "query");
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batchresult/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      res.status(200).json(download.data);
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailVerificationFile Controller", error, req);
      res.status(400).json(error);
    }
  },


  getAlreadyCheckedBatchEmailFinderFiles:async(req,res)=>{
    try {
      let user = await db.query(
        `SELECT * from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let files=await db.query(`SELECT * FROM useractivity_batch_finder_link where userid='${user[0][0].rowid}'`)
      res.status(200).json(files[0])
    } catch (error) {
      console.log(error);
      // ErrorHandler("getAlreadyCheckedBatchEmailFinderFiles Controller", error, req);
      res.status(400).json(error);
    }
  },
  batchEmailFinder:async(req,res)=>{
    try {
      console.log(req.body.data,'req body')
      let user = await db.query(
        `SELECT * from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      const data = {
        gamalogic_emailid_finder: req.body.data,
      };
      let response = await axios.post(
        `https://gamalogic.com/batch-email-discovery/?apikey=${process.env.API_KEY}`,
        data
      ); 
      console.log(response,'response is here')
      
      let currenttime = new Date();
      const formattedDate = currenttime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;
      let fileAdded = await db.query(
        `INSERT INTO useractivity_batch_finder_link(id,userid,apikey,date_time,speed_rank,count,ip_address,user_agent,file,file_upload,is_api,is_api_file,is_dashboard)VALUES('${response.data["batch id"]}','${user[0][0].rowid}','${apiKey}','${formattedDate}',0,'${response.data["total count"]}','${ip}','${userAgent}','${req.body.fileName}','${req.body.fileName}',1,0,0)`
      );
      let files=await db.query(`SELECT * FROM useractivity_batch_finder_link where id='${response.data["batch id"]}'`)
        console.log(files[0],'fiels')
      res.status(200).json({message:response.data.message,files:files[0][0]});
    } catch (error) {
      console.log(error)
      res.status(400).json(error)
    }
  },
  batchEmailFinderStatus: async (req, res) => {
    try {
      console.log('hiiiiii')
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      let emailStatus = await axios.get(
        `https://gamalogic.com/batch-email-discovery-status/?apikey=${process.env.API_KEY}&batchid=${req.query.id}`
      );
      console.log(emailStatus.data, "status");
      res.status(200).json({ emailStatus: emailStatus.data });
    } catch (error) {
      console.log(error);
      // ErrorHandler("batchEmailStatus Controller", error, req);
      res.status(400).json(error);
    }
  },
  downloadEmailFinderResultFile: async (req, res) => {
    try {
      console.log(req.query.batchId, "query");
      let user = await db.query(
        `SELECT api_key from registration WHERE emailid='${req.user[0][0].emailid}'`
      );
      let apiKey = user[0][0].api_key;
      let download = await axios.get(
        `https://gamalogic.com/batch-email-discovery-result/?apikey=${process.env.API_KEY}&batchid=${req.query.batchId}`
      );
      console.log(download,'download file')
      res.status(200).json(download.data);
    } catch (error) {
      console.log(error);
      ErrorHandler("downloadEmailVerificationFile Controller", error, req);
      res.status(400).json(error);
    }
  },

  updateCredit:async(req,res)=>{
    try {
      console.log(req.body ,'body of credit change is here')
      let credit=await db.query( `SELECT credits from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let newBalance=credit[0][0].credits+req.body.credits
      await db.query(`UPDATE registration SET credits='${newBalance}' WHERE emailid='${req.user[0][0].emailid}'`)
      res.status(200).json('successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("updateCredit Controller", error, req);
      res.status(400).json(error);
    }
  }
};
export default APIControllers;
