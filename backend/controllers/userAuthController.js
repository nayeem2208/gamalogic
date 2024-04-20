import db from "../config/DB.js";
import generateToken from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import generateUniqueApiKey from "../utils/generatePassword.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";
import sendEmail from "../utils/zeptoMail.js";
import axios from "axios";
import ErrorHandler from "../utils/errorHandler.js";

const Authentication = {
  sample: async (req, res) => {
    ///its for checking purpose
    try {
      // Simulating an error for demonstration purposes
      // console.log(req.route.path,'original url')
      // console.log(johnhoe)
      // sendEmail('nayeem@gmail.com')
      // let response = await axios.get("http://localhost:3000/hi");
    } catch (error) {
      ErrorHandler("Sample Controller", error, req);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      let user = await db.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (user[0].length > 0) {
        const hashedPassword = user[0][0].password;
        let passwordMatch = await verifyPassword(password, hashedPassword);
        if (passwordMatch) {
          if (user[0][0].confirmed == 1) {
            let token = generateToken(res, user[0][0].rowid);
            let creditBal;

            if (user[0][0].credits > 0) {
              creditBal = user[0][0].credits;
            } else if (user[0][0].credits_free > 0) {
              let finalFree = new Date(user[0][0].free_final);
              let finalFreeDate = new Date(finalFree);
              let currentDate = new Date();
              if (finalFreeDate > currentDate) {
                creditBal = user[0][0].credits_free;
              } else creditBal = 0;
            } else {
              creditBal = 0;
            }

            res.json({
              name: user[0][0].username,
              credit: creditBal,
              token,
            });
          } else {
            res.status(401).json({ error: "Please verify your email" });
          }
        } else {
          res.status(401).json({ error: "Incorrect password" });
        }
      } else {
        res.status(401).json({ error: "Invalid User" });
      }
    } catch (error) {
      ErrorHandler("Login Controller", error, req);
      res.status(400).json(error);
    }
  },
  registerUser: async (req, res) => {
    try {
      const { fullname, email, password } = req.body.data;
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;
      // console.log(req.body.token,'token')
      // console.log(process.env.RECAPTCHA_SECRET_KEY,'key is getting ')
      // const response = await axios.post(
      //   "https://www.google.com/recaptcha/api/siteverify",
      //   {
      //     secret: process.env.RECAPTCHA_SECRET_KEY,
      //     response: req.body.token,
      //   }
      // );
      // console.log(response,'data')
      // if(response.data.success){
      let userExists = await db.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(401).json({ error: "User already exists" });
      } else {
        // let hashedPassword = await bcrypt.hash(password, 10);
        let hashedPassword = await passwordHash(password);
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 7);
        const formattedDate = currentDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const freeFinalDate = futureDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        let apiKey = await generateUniqueApiKey();
        await db.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,api_key,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium)VALUES(null,'${fullname}','${email}','${hashedPassword}','${formattedDate}',0,'${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',0,0)`
        );
        sendEmail(
          email,
          "Please verify your account",
          `<p>Hi ${email}, please click <a href="http://localhost:5173/signin?email=${email}&track=true">here</a> to verify your account </p>`
        );
        res.status(200).json("Please check your email for verification");
      }
      // }
      // else{
      //   res.status(400).json({error:'Failed in human verification'})
      // }
    } catch (error) {
      ErrorHandler("registerUser Controller", error, req);
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  },
  googleLogin: async (req, res) => {
    try {
      const token = req.body.credentialResponse.credential;
      const decode = jwt.decode(token);
      const { email } = decode;
      let user = await db.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (user[0].length > 0) {
        const token = generateToken(res, user[0][0].rowid);
        let creditBal;

        if (user[0][0].credits > 0) {
          creditBal = user[0][0].credits;
        } else if (user[0][0].credits_free > 0) {
          let finalFree = new Date(user[0][0].free_final);
          let finalFreeDate = new Date(finalFree);
          let currentDate = new Date();
          if (finalFreeDate > currentDate) {
            creditBal = user[0][0].credits_free;
          } else creditBal = 0;
        } else {
          creditBal = 0;
        }

        res.status(200).json({
          name: user[0][0].username,
          credit: creditBal,
          token,
        });
      } else {
        res.status(400).json({
          error:
            "Invalid User , Please Sign up with google to use this Sign in",
        });
      }
    } catch (error) {
      ErrorHandler("googleLogin Controller", error, req);
      res.status(400).json(error);
    }
  },
  googleAuth: async (req, res) => {
    try {
      const body_Token = req.body.credentialResponse.credential;
      const decode = jwt.decode(body_Token);
      const { name, email } = decode;

      const userExists = await db.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(400).json({ error: "User already exists" });
      } else {
        const userAgent = req.headers["user-agent"];
        const ip = req.ip;
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 7);
        const formattedDate = currentDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const freeFinalDate = futureDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        let apiKey = await generateUniqueApiKey();

        await db.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium)VALUES(null,'${name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0)`
        );
        let user = await db.query(
          `SELECT * FROM registration WHERE emailid='${email}'`
        );
        if (user[0].length > 0) {
          const token = generateToken(res, user[0][0].rowid);
          res.json({
            name: user[0][0].username,
            credit: 500,
            token,
          });
        } else {
          res
            .status(400)
            .json({ error: "Error while adding user with google" });
        }
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("googleAuth Controller", error, req);
      res.status(400).json({ error });
    }
  },
  verifyEmail: async (req, res) => {
    try {
      console.log("verifyi il etheetindtta");
      const userEmail = req.query.email;
      let confirmedDate = new Date();
      const query = `UPDATE registration SET confirmed = 1 ,confirmed_on=? ,referer=? WHERE emailid = ?`;
      await db.query(query, [confirmedDate, req.headers.origin, userEmail]);
      let verifiedUser = await db.query(
        `SELECT * FROM registration WHERE emailid='${userEmail}' AND confirmed=1`
      );
      if (verifiedUser.length > 0) {
        let token = generateToken(res, verifiedUser[0][0].rowid);
        res.json({
          name: verifiedUser[0][0].username,
          token,
        });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("verifyEmail Controller", error, req);
      res.status(400).json({ error });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      let user = await db.query(
        `SELECT * FROM registration WHERE emailid='${req.body.email}'`
      );
      if (user[0].length > 0) {
        sendEmail(
          req.body.email,
          "Reset your password",
          "<p>hi " +
            req.body.email +
            ',please click <a href="http://localhost:5173/resetPassword?email=' +
            req.body.email +
            '">here </a> to reset your password</p>  '
        );
        res
          .status(200)
          .json({ message: "Please check your email for reset password link" });
      } else {
        res.status(400).json({ error: "Invalid email Id" });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("forgotPassword Controller", error, req);
      res.status(400).json(error);
    }
  },
  resetPassword: async (req, res) => {
    try {
      let user = await db.query(
        `SELECT * FROM registration WHERE emailid='${req.body.email}'`
      );
      if (user[0].length > 0) {
        // let hash = generateSHA256Hash(req.body.password);
        let hashedPassword = await passwordHash(req.body.password);
        console.log(hashedPassword, "hashed password");
        await db.query(
          `UPDATE registration SET password='${hashedPassword}' WHERE emailid='${req.body.email}'`
        );
        res.status(200).json({ message: "password succesfully updated" });
      } else {
        res.status(400).json({ error: "Invalid user" });
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("resetPassword Controller", error, req);
      res.status(400).json({ error });
    }
  },
};
export default Authentication;
