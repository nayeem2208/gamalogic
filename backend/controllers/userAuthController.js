// import dbConnection from "../config/RemoteDb.js"
import generateToken from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import generateUniqueApiKey from "../utils/generatePassword.js";
import { passwordHash, verifyPassword } from "../utils/passwordHash.js";
import sendEmail from "../utils/zeptoMail.js";
import axios from "axios";
import ErrorHandler from "../utils/errorHandler.js";
import generateConfirmationToken from "../utils/confirmationToken.js";
import isDisposableURL from "../utils/disposibleEmailList.js";

const Authentication = {
  sample: async (req, res) => {
    ///its for checking purpose
    try {
      console.log(req, 'req is here')
      const referrer = req.headers.referer || req.headers.referrer;
      console.log(referrer, 'referrrrrrrrrrrrrrrrrrrrrrr')
      res.send('hiii its working')
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
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (user[0].length > 0) {
        if (user[0][0].session_google == 1) {
          return res.status(401).json({
            error: `Incorrect password
          ` });

        }
        const hashedPassword = user[0][0].password;
        let passwordMatch = await verifyPassword(password, hashedPassword);
        if (passwordMatch) {
          if (user[0][0].confirmed == 1) {
            let token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
            let creditBal;
            let finalFree = new Date(user[0][0].free_final);
            let finalFreeDate = new Date(finalFree);
            let currentDate = new Date();
            if (user[0][0].credits_free > 0 && finalFreeDate > currentDate) {
              creditBal = user[0][0].credits_free + user[0][0].credits
            } else {
              creditBal = user[0][0].credits;
            }

            res.json({
              name: user[0][0].username,
              email: user[0][0].emailid,
              credit: creditBal,
              token,
              confirm: 1
            });
          } else {
            res.status(201).json({ confirm: 0 })
          }
        } else {
          res.status(401).json({ error: "Incorrect password" });
        }
      } else {
        res.status(401).json({ error: "Invalid User" });
      }
      await dbConnection.end()
    } catch (error) {
      ErrorHandler("Login Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  registerUser: async (req, res) => {
    try {
      const { fullname, email, password } = req.body.data;
      const userAgent = req.headers["user-agent"];
      let ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';

      const dbConnection = req.dbConnection;
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
      let userExists = await dbConnection.query(
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
        let apiKey = await generateUniqueApiKey(req);
        await dbConnection.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium)VALUES(null,'${fullname}','${email}','${hashedPassword}','${formattedDate}',0,'${freeFinalDate}',0,0,'${ip}','${userAgent}',0,0)`
        );
        let token = generateConfirmationToken(email)
        sendEmail(
          fullname,
          email,
          "Please Verify Your Account",
          `<p>Hi ${fullname},</p>
    <p>Welcome to Gamalogic! To start using your account, please click the link below to verify your email address:</p>
    <p><a href="https://beta.gamalogic.com/api/verifyEmail?email=${token}">Verify Your Account</a></p>
    <p>Thank you for joining us. If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,</p>
    <p>Gamalogic</p>`
        );

        res.status(200).json("Please check your email for verification link");
      }
      // }
      // else{
      //   res.status(400).json({error:'Failed in human verification'})
      // }
      await dbConnection.end()
    } catch (error) {
      ErrorHandler("registerUser Controller", error, req);
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  googleLogin: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const token = req.body.credentialResponse.credential;
      const decode = jwt.decode(token);
      const { email } = decode;
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (user[0].length > 0) {
        const token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
        let creditBal;
        let finalFree = new Date(user[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        if (user[0][0].credits_free > 0 && finalFreeDate > currentDate) {
          creditBal = user[0][0].credits_free + user[0][0].credits
        } else {
          creditBal = user[0][0].credits;
        }


        res.status(200).json({
          name: user[0][0].username,
          email: user[0][0].emailid,
          credit: creditBal,
          token
        });
      } else {
        res.status(400).json({
          error:
            "Unauthorised Access, Please register with google login",
        });
      }
      await dbConnection.end()
    } catch (error) {
      ErrorHandler("googleLogin Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  googleAuth: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const body_Token = req.body.credentialResponse.credential;
      const decode = jwt.decode(body_Token);
      const { name, email } = decode;

      const userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(400).json({ error: "User already exists" });
      } else {
        const userAgent = req.headers["user-agent"];
        let ip = req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress || '';
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

        let apiKey = await generateUniqueApiKey(req);

        await dbConnection.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium)VALUES(null,'${name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0)`
        );
        let user = await dbConnection.query(
          `SELECT * FROM registration WHERE emailid='${email}'`
        );
        if (user[0].length > 0) {
          const token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
          sendEmail(
            user[0][0].username,
            user[0][0].emailid,
            "Welcome to Gamalogic!",
            `<p>Hi ${user[0][0].username},</p>
            <p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
            <p>Your registration is now complete, and you're all set to explore our platform.</p>
            <p>If you have any questions or need assistance getting started, feel free to reach out to us.</p>
            <p>Best regards,</p>
            <p>The Gamalogic Team</p>`
          );
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            credit: 500,
            token,
          });
        } else {
          res
            .status(400)
            .json({ error: "Error while adding user with google login" });
        }
      }
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("googleAuth Controller", error, req);
      res.status(400).json({ error });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  verifyEmail: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let referer = req.headers.referer || null
      const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
      const userEmail = decoded.email;
      let disposibleEmail = isDisposableURL(referer)
      console.log(disposibleEmail,'disposible emial is hereeeee')
      if (disposibleEmail) {
        res.redirect('https://beta.gamalogic.com/blocked')
        return
      }
      const alreadyVerifiedUser = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${userEmail}' AND confirmed=1`
      );
      if (alreadyVerifiedUser[0].length > 0) {
        return res.status(200).json({ message: "User is already verified." });
      }
      let apiKey = await generateUniqueApiKey(req);
      let confirmedDate = new Date();
      const query = `UPDATE registration SET confirmed = 1 ,confirmed_on=? ,api_key=?,referer=?, credits_free=500  WHERE emailid = ?`;
      await dbConnection.query(query, [confirmedDate, apiKey, referer, userEmail]);
      let verifiedUser = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${userEmail}' AND confirmed=1`
      );
      if (verifiedUser.length > 0) {
        let token = generateToken(res, verifiedUser[0][0].rowid, verifiedUser[0][0].api_key);
        let creditBal;
        let finalFree = new Date(verifiedUser[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        if (verifiedUser[0][0].credits_free > 0 && finalFreeDate > currentDate) {
          creditBal = verifiedUser[0][0].credits_free + verifiedUser[0][0].credits
        } else {
          creditBal = verifiedUser[0][0].credits;
        }
        sendEmail(
          verifiedUser[0][0].username,
          verifiedUser[0][0].emailid,
          "Welcome to Gamalogic!",
          `<p>Hi ${verifiedUser[0][0].username},</p>
          <p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
          <p>Your registration is now complete, and your account has been successfully verified.</p>
          <p>You're all set to explore our platform. If you have any questions or need assistance getting started, feel free to reach out to us.</p>
          <p>Best regards,</p>
          <p>The Gamalogic Team</p>`
        );
        // res.json({
        //   name: verifiedUser[0][0].username,
        //   email: verifiedUser[0][0].emailid,
        //   token,
        //   credit: creditBal
        // });
        res.redirect('https://beta.gamalogic.com/EmailConfirmed');

      }
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("verifyEmail Controller", error, req);
      res.status(400).json({ error });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  forgotPassword: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${req.body.email}'`
      );
      if (user[0].length > 0) {
        if (user[0][0].session_google == 1) {
          res.status(401).json({
            error: `Unauthorised access
          ` });
          return
        }
        let token = generateConfirmationToken(req.body.email)
        sendEmail(
          user[0][0].username,
          req.body.email,
          "Reset your password",
          `<p>Hi ${user[0][0].username},</p>
          <p>We received a request to reset your password. To proceed with resetting your password, please click the link below:</p>
          <p><a href="https://beta.gamalogic.com/resetPassword?email=${token}">Reset Password</a></p>
          <p>If you didn't request this change, you can ignore this email. Your account security is important to us.</p>
          <p>Best regards,</p>
          <p>Gamalogic </p>`
        );
        res
          .status(200)
          .json({ message: "Please check your email for reset password link" });
      } else {
        res.status(400).json({ error: "Invalid email Id" });
      }
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("forgotPassword Controller", error, req);
      res.status(400).json(error);
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  resetPassword: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const decoded = jwt.verify(req.body.email, process.env.JWT_SECRET);
      const userEmail = decoded.email;
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${userEmail}'`
      );
      if (user[0].length > 0) {
        // let hash = generateSHA256Hash(req.body.password);
        let hashedPassword = await passwordHash(req.body.password);
        await dbConnection.query(
          `UPDATE registration SET password='${hashedPassword}' WHERE emailid='${userEmail}'`
        );
        sendEmail(
          user[0][0].username,
          userEmail,
          "Password successfully updated",
          `<p>Hi ${user[0][0].username},</p>

          <p>Your password has been successfully updated.</p>
          
          <p>If you did not initiate this action, please contact us immediately.</p>
          
          <p>Best regards,</p>
            <p>Gamalogic</p>
          `
        );
        res.status(200).json({ message: "Password succesfully updated" });
      } else {
        res.status(400).json({ error: "Invalid user" });
      }
      await dbConnection.end()
    } catch (error) {
      console.log(error);
      ErrorHandler("resetPassword Controller", error, req);
      res.status(400).json({ error });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    }

  },
  sendVerifyEmail: async (req, res) => {
    try {
      const username = req.query.email.split('@')[0];
      let token = generateConfirmationToken(req.query.email)
      sendEmail(
        username,
        req.query.email,
        "Please Verify Your Account",
        `<p>Hi ${username},</p>
  <p>Welcome to Gamalogic! To start using your account, please click the link below to verify your email address:</p>
  <p><a href="https://beta.gamalogic.com/api/verifyEmail?email=${token}">Verify Your Account</a></p>
  <p>Thank you for joining us. If you have any questions, feel free to contact our support team.</p>
  <p>Best regards,</p>
  <p>Gamalogic</p>`
      );
      res.status(200)
    } catch (error) {
      console.log(error);
      ErrorHandler("sendVerifyEmail Controller", error, req);
      res.status(400).json({ error });
    }
  }
};
export default Authentication;
