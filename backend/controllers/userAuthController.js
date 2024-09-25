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
import verifyEmailTemplate from "../EmailTemplates/verifyTemplate.js";
import basicTemplate from "../EmailTemplates/BasicTemplate.js";
import forgotPasswordTemplate from "../EmailTemplates/forgotPasswordTemplate.js";
import urls from "../ConstFiles/urls.js";
import leadGeneration from "../utils/crm.js";
import AddContacts from "../utils/campaigns.js";

const Authentication = {
  sample: async (req, res) => {
    ///its for checking purpose
    try {
      // let dbConnection = req.dbConnection
      // let token = '123'
      // // let token = 'AQVkAFg4Qcyjcv5mhrmakhf86FMFsFbtdfDY2ZoLhMH1n5QU1ByJV0baVPGDKCq2Qw3bMo3AclLXpSH8SzzY1Pp_dnpq9MalTojwYi96rseFR-U5MVBFoVaWmOcKv8VtbqXqIigNsTRnjLqz5zazqKHEnNVCu9YGkyLYjkd7u66ZDt8orDSwmb8J_OJqU5lNWIXSYHu-5a3zkxNjapnEWCwM7jujWn8ZXUNZ5FOwyi77fSG4NYalhHUbOGaFA2uppleCoan5pcHQaHaU3sczGSc5ocBqS5IUHESD2aIog3gTxSUQbgQqRRjUBWr-N-dNllrQYkin_i2YozvH_Em2RVsudDeRDQ';
      // let expiry = 5183999; // expiry in seconds

      // let currentDate = new Date(); // current date
      // let expirationDate = new Date(currentDate.getTime() + expiry * 1000); // expiry in milliseconds
      // let exp = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

      // await dbConnection.query(`INSERT INTO TOKEN (linkedin_access_token, expiry) VALUES ('${token}', '${exp}')`);
      res.send('hiii its working')
    } catch (error) {
      ErrorHandler("Sample Controller", error, req);
    }
  },
  samplePost:async (req, res) => {
    ///its for checking purpose
    try {
      console.log(req.body,'req.body')
       ErrorHandler("webhook checker", req.body, req);
      res.send('hiiii its working')
    } catch (error) {
      // ErrorHandler("Sample Controller", error, req);
      console.log(error)
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
        if (user[0][0].session_google == 1 && user[0][0].password == 0) {
          return res.status(401).json({
            error: `Incorrect password
          ` });

        }
        if (user[0][0].referer !== null) {
          let disposibleEmail = isDisposableURL(user[0][0].referer)
          if (disposibleEmail) {
            return res.status(202).json({ error: 'Blocked' })
          }
        }
        const hashedPassword = user[0][0].password;
        let passwordMatch = await verifyPassword(password, hashedPassword);
        if (passwordMatch) {
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
          let password = user[0][0].password !== 0;
          let ip = req.headers['cf-connecting-ip'] ||
            req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress || '';

          // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
          // const { country_name } = response.data;
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: creditBal,
            token,
            confirm: user[0][0].confirmed,
            password,
            country_name: 'USA'
          });

        } else {
          res.status(401).json({ error: "Incorrect password" });
        }
      } else {
        res.status(401).json({ error: "Invalid User" });
      }
    } catch (error) {
      ErrorHandler("Login Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  registerUser: async (req, res) => {
    try {
      const { firstname, lastname, email, password } = req.body.data;
      const userAgent = req.headers["user-agent"];
      let ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';

      const dbConnection = req.dbConnection;
      let userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(401).json({ error: "User already exists" });
      } else {
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': 'b599a641bc6e680d90b0041b463c36ec',
            'Content-Type': 'application/json',
          };

          const data = {
            email: email,
            widget_code: req.body.widgetCode,
            thrive_ref_id: req.body.thriveRefId,
            first_name: firstname,
            last_name: lastname,
          };
          try {
            const response = await axios.post(url, data, { headers });
          } catch (error) {
            ErrorHandler("verifyEmail Controller thrive signup section", error, req);
          }
        }
        let fullname = firstname + ' ' + lastname
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
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium,firstname,lastname)VALUES(null,'${fullname}','${email}','${hashedPassword}','${formattedDate}',0,'${freeFinalDate}',0,0,'${ip}','${userAgent}',0,0,'${firstname}','${lastname}')`
        );
        try {
          leadGeneration(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("registerUser Controller CRM lead Generation ", error, req);
        }
        try {
          AddContacts(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("registerUser Controller Campaigns add contacts ", error, req)
        }
        let token = generateConfirmationToken(email)
        let link = `${urls.frontendUrl}/api/verifyEmail?email=${token}`
        sendEmail(
          fullname,
          email,
          "Please Verify Your Account",
          verifyEmailTemplate(fullname, token, link)
        );
        res.status(200).json("Please check your email for verification link");
      }
    } catch (error) {
      ErrorHandler("registerUser Controller", error, req);
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
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

        let password = user[0][0].password != 0;
        let ip = req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress || '';
        // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        // const { country_name } = response.data;
        res.status(200).json({
          name: user[0][0].username,
          email: user[0][0].emailid,
          firstname: user[0][0].firstname || null,
          lastname: user[0][0].lastname || null,
          credit: creditBal,
          token,
          confirm: 1,
          password,
          country_name: 'USA'
        });
      } else {
        res.status(400).json({
          error:
            "Unauthorised Access, Please register with us",
        });
      }
    } catch (error) {
      ErrorHandler("googleLogin Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  googleAuth: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const body_Token = req.body.credentialResponse.credential;
      const decode = jwt.decode(body_Token);
      const { name, email } = decode;
      let [firstname, ...lastnameArray] = name.split(" ");
      let lastname = lastnameArray.join(" ");
      if (!lastname || !isNaN(lastname)) {
        lastname = firstname
        firstname = ''
      }
      const userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(400).json({ error: "User already exists" });
      } else {
        console.log(req.body.widgetCode ,req.body.thriveRefId,'widget and refidddddd')
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': 'b599a641bc6e680d90b0041b463c36ec',
            'Content-Type': 'application/json',
          };

          const data = {
            email: email,
            widget_code: req.body.widgetCode,
            thrive_ref_id: req.body.thriveRefId,
            first_name: firstname,
            last_name: lastname,
          };
          try {
            
            const response = await axios.post(url, data, { headers });
          } catch (error) {
            ErrorHandler("Google Auth Controller Thrive signin section", error, req);
          }
        }
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
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium,firstname,lastname)VALUES(null,'${name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0,'${firstname}','${lastname}')`
        );
        try {
          leadGeneration(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("Google Auth Controller CRM lead Generation ", error, req);
        }
        try {
          AddContacts(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("Google Auth Controller Campaigns add contacts ", error, req)
        }
        let user = await dbConnection.query(
          `SELECT * FROM registration WHERE emailid='${email}'`
        );
        if (user[0].length > 0) {
          const token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
          let content = `<p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
          <p>Your registration is now complete, and you're all set to explore our platform.</p>
          <p>If you have any questions or need assistance getting started, feel free to reach out to us.</p>
          <div class="verify">
          <a href="${urls.frontendUrl}/"><button
                  class="verifyButton">Sign In</button></a>

          </div>`
          sendEmail(
            user[0][0].username,
            user[0][0].emailid,
            "Welcome to Gamalogic!",
            basicTemplate(user[0][0].username, content)
          );
          let password = false
          // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
          // const { country_name } = response.data;
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: 500,
            token,
            confirm: 1,
            password,
            country_name: 'USA'
          });
        } else {
          res
            .status(400)
            .json({ error: "Error while adding user with google login" });
        }
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("googleAuth Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  linkedinSignUp: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const { code ,widgetCode,thriveRefId} = req.body;
      if (!code) throw new Error('No code provided')
      const accessTokenUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${encodeURIComponent(code)}&client_id=${process.env.LINKEDIN_CLIENTID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_SIGNUP_REDIRECT_URI)}`;
      try {
        // let accessTokenResponse = await axios.get(accessTokenUrl);
        const getAccessToken = async (url, retries = 3, delay = 5000) => {
          for (let i = 0; i < retries; i++) {
            try {
              let accessTokenResponse = await axios.get(url);
              return accessTokenResponse.data;
            } catch (error) {
              if (i === retries - 1) throw error;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        };
    
        const accessTokenData = await getAccessToken(accessTokenUrl);

        try {
          const axiosInstance = axios.create({
            timeout: 15000,
            maxRedirects: 5,
            headers: {
              'Authorization': `Bearer ${accessTokenData.access_token}`,
            },
          });
          const userInfoResponse = await axiosInstance.get('https://api.linkedin.com/v2/userinfo')
          const { given_name, email } = userInfoResponse.data;
          let [firstname, ...lastnameArray] = given_name.split(" ");
          let lastname = lastnameArray.join(" ");
          if (!lastname || !isNaN(lastname)) {
            lastname = firstname
            firstname = ''
          }
          const userExists = await dbConnection.query(
            `SELECT * FROM registration WHERE emailid='${email}'`
          );
          if (userExists[0].length > 0) {
            res.status(400).json({ error: "User already exists" });
          } else {
            if (widgetCode && thriveRefId) {
              const url = `https://thrive.zoho.com/thrive/webhooks/${widgetCode}/mapreferral`;
    
              const headers = {
                'thrive-secret-hash': 'b599a641bc6e680d90b0041b463c36ec',
                'Content-Type': 'application/json',
              };
    
              const data = {
                email: email,
                widget_code: widgetCode,
                thrive_ref_id: thriveRefId,
                first_name: firstname,
                last_name: lastname,
              };
              try {
                
                const response = await axios.post(url, data, { headers });
              } catch (error) {
                ErrorHandler("Linkedin signup Controller Thrive signin section", error, req);
              }
            }
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
              `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,is_linkedin,is_premium,firstname,lastname)VALUES(null,'${given_name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0,'${firstname}','${lastname}')`
            );
            try {
              leadGeneration(firstname, lastname, email)
            } catch (error) {
              ErrorHandler("Linkedin registerUser Controller CRM lead Generation ", error, req);
            }
            try {
              AddContacts(firstname, lastname, email)
            } catch (error) {
              ErrorHandler("Linkedin registerUser Controller Campaigns add contacts ", error, req)
            }
            let user = await dbConnection.query(
              `SELECT * FROM registration WHERE emailid='${email}'`
            );
            if (user[0].length > 0) {
              const token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
              let content = `<p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
              <p>Your registration is now complete, and you're all set to explore our platform.</p>
              <p>If you have any questions or need assistance getting started, feel free to reach out to us.</p>
              <div class="verify">
              <a href="${urls.frontendUrl}/"><button
                      class="verifyButton">Sign In</button></a>
    
              </div>`
              sendEmail(
                user[0][0].username,
                user[0][0].emailid,
                "Welcome to Gamalogic!",
                basicTemplate(user[0][0].username, content)
              );
              let password = false
              res.json({
                name: user[0][0].username,
                email: user[0][0].emailid,
                firstname: user[0][0].firstname || null,
                lastname: user[0][0].lastname || null,
                credit: 500,
                token,
                confirm: 1,
                password,
              });
            } else {
              res
                .status(400)
                .json({ error: "Error while adding user with google login" });
            }
          }
        } catch (error) {
          console.log(error)
          ErrorHandler("Linkedin Signup Controller ", error, req);

        }
      } catch (error) {
        console.log(error)
        ErrorHandler("Linkedin Signup Controller,Access Token ", error, req);
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("Linkedin Signup Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  linkedinSignIn: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      const { code } = req.body;
      if (!code) throw new Error('No code provided')
      const accessTokenUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${encodeURIComponent(code)}&client_id=${process.env.LINKEDIN_CLIENTID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_LOGIN_REDIRECT_URI)}`;
      try {
        const getAccessToken = async (url, retries = 3, delay = 5000) => {
          for (let i = 0; i < retries; i++) {
            try {
              let accessTokenResponse = await axios.get(url);
              return accessTokenResponse.data;
            } catch (error) {
              if (i === retries - 1) throw error;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        };
    
        const accessTokenData = await getAccessToken(accessTokenUrl);
        try {
          const axiosInstance = axios.create({
            timeout: 15000,
            maxRedirects: 5,
            headers: {
              'Authorization': `Bearer ${accessTokenData.access_token}`,
            },
          });
          const userInfoResponse = await axiosInstance.get('https://api.linkedin.com/v2/userinfo')
          const { email } = userInfoResponse.data;
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
            let password = user[0][0].password != 0;
            let ip = req.headers['cf-connecting-ip'] ||
              req.headers['x-real-ip'] ||
              req.headers['x-forwarded-for'] ||
              req.socket.remoteAddress || '';
            // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
            // const { country_name } = response.data;
            res.status(200).json({
              name: user[0][0].username,
              email: user[0][0].emailid,
              firstname: user[0][0].firstname || null,
              lastname: user[0][0].lastname || null,
              credit: creditBal,
              token,
              confirm: 1,
              password,
              country_name: 'India'
            });
          } else {
            res.status(400).json({
              error:
                "Unauthorised Access, Please register with us",
            });
          }
        } catch (error) {
          console.log(error)
          ErrorHandler("Linkedin Login Controller", error, req);
        }


      } catch (error) {
        console.log(error)
        ErrorHandler("Linkedin Login Controller,Access Token", error, req);
      }
    } catch (error) {
      console.log(error);
      ErrorHandler("Linkedin Login Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  microsoftSignUP: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let email = req.body.mail
      let given_name = req.body.displayName
      let [firstname, ...lastnameArray] = given_name.split(" ");
      let lastname = lastnameArray.join(" ");
      if (!lastname || !isNaN(lastname)) {
        lastname = firstname
        firstname = ''
      }
      const userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(400).json({ error: "User already exists" });
      } else {
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': 'b599a641bc6e680d90b0041b463c36ec',
            'Content-Type': 'application/json',
          };

          const data = {
            email: email,
            widget_code: req.body.widgetCode,
            thrive_ref_id: req.body.thriveRefId,
            first_name: firstname,
            last_name: lastname,
          };
          try {
            
            const response = await axios.post(url, data, { headers });
          } catch (error) {
            ErrorHandler("Google Auth Controller Thrive signin section", error, req);
          }
        }
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
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,is_microsoft,is_premium,firstname,lastname)VALUES(null,'${given_name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0,'${firstname}','${lastname}')`
        );
        try {
          leadGeneration(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("Microsoft Signup Controller CRM lead Generation ", error, req);
        }
        try {
          AddContacts(firstname, lastname, email)
        } catch (error) {
          ErrorHandler("Microsoft Signup Controller Campaigns add contacts ", error, req)
        }
        let user = await dbConnection.query(
          `SELECT * FROM registration WHERE emailid='${email}'`
        );
        if (user[0].length > 0) {
          const token = generateToken(res, user[0][0].rowid, user[0][0].api_key);
          let content = `<p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
          <p>Your registration is now complete, and you're all set to explore our platform.</p>
          <p>If you have any questions or need assistance getting started, feel free to reach out to us.</p>
          <div class="verify">
          <a href="${urls.frontendUrl}/"><button
                  class="verifyButton">Sign In</button></a>

          </div>`
          sendEmail(
            user[0][0].username,
            user[0][0].emailid,
            "Welcome to Gamalogic!",
            basicTemplate(user[0][0].username, content)
          );
          let password = false
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: 500,
            token,
            confirm: 1,
            password,
          });
        } else {
          res
            .status(400)
            .json({ error: "Error while adding user with Microsoft Signup" });
        }
      }

    } catch (error) {
      console.log(error)
      ErrorHandler("Microsoft Sigup Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  microsoftLogin: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let email = req.body.mail
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

        let password = user[0][0].password != 0;
        let ip = req.headers['cf-connecting-ip'] ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress || '';
        // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        // const { country_name } = response.data;
        res.status(200).json({
          name: user[0][0].username,
          email: user[0][0].emailid,
          firstname: user[0][0].firstname || null,
          lastname: user[0][0].lastname || null,
          credit: creditBal,
          token,
          confirm: 1,
          password,
          country_name: 'India'
        });
      } else {
        res.status(400).json({
          error:
            "Unauthorised Access, Please register with us",
        });
      }
    } catch (error) {
      console.log(error)
      ErrorHandler("Microsoft Login Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }
  },
  microsoftDomainVerification: (req, res) => {
    res.json({
      "associatedApplications": [
        {
          "applicationId": "4ccd9d93-d389-4fa4-a2ac-ce82f2a01999"
        }
      ]
    });
  },
  verifyEmail: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let referer = req.headers.referer || null
      const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
      const userEmail = decoded.email;
      if (referer) {
        let disposibleEmail = isDisposableURL(referer)
        if (disposibleEmail) {
          const query = `UPDATE registration SET referer=? WHERE emailid = ?`;
          await dbConnection.query(query, [referer, userEmail]);
          res.redirect(`${urls.frontendUrl}/blocked`)
          return
        }
      }
      const alreadyVerifiedUser = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${userEmail}' AND confirmed=1`
      );
      if (alreadyVerifiedUser[0].length > 0) {
        return res.redirect(`${urls.frontendUrl}/EmailAlreadyverified`)
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
        let content = ` <p>Welcome to Gamalogic! We're thrilled to have you on board.</p>
        <p>Your registration is now complete, and your account has been successfully verified.</p>
        <p>You're all set to explore our platform. If you have any questions or need assistance getting started, feel free to reach out to us.</p>
        <div class="verify">
                    <a href="${urls.frontendUrl}/"><button
                            class="verifyButton">Sign In</button></a>
    
                    </div>`
        sendEmail(
          verifiedUser[0][0].username,
          verifiedUser[0][0].emailid,
          "Welcome to Gamalogic!",
          basicTemplate(verifiedUser[0][0].username, content)
        );
        res.redirect(`${urls.frontendUrl}/EmailConfirmed?confirm=true`);

      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'link has expired,please resend email' });
      } else {
        console.log(error);
        ErrorHandler("verifyEmail Controller", error, req);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
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
        if ((user[0][0].session_google == 1 && user[0][0].password == 0) || user[0][0].confirmed == 0) {
          res.status(401).json({
            error: `Unauthorised access
          ` });
          return
        }
        let token = generateConfirmationToken(req.body.email)
        let link = `${urls.frontendUrl}/reset?email=${token}`
        sendEmail(
          user[0][0].username,
          req.body.email,
          "Reset your password",
          forgotPasswordTemplate(user[0][0].username, token, link)
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
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
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
        let hashedPassword = await passwordHash(req.body.password);
        await dbConnection.query(
          `UPDATE registration SET password='${hashedPassword}' WHERE emailid='${userEmail}'`
        );
        let content = ` <p>Your password has been successfully updated.</p>
          
        <p>If you did not initiate this action, please contact us immediately.</p> 
        <div class="verify">
        <a href="${urls.frontendUrl}/"><button
                class="verifyButton">Sign In</button></a>

        </div>`
        sendEmail(
          user[0][0].username,
          userEmail,
          "Password successfully updated",
          basicTemplate(user[0][0].username, content)
        );
        res.status(200).json({ message: "Password succesfully updated" });
      } else {
        res.status(400).json({ error: "Invalid user" });
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'link has expired,please resend email' });
      } else {
        console.log(error);
        ErrorHandler("resetPassword Controller", error, req);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } finally {
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  sendVerifyEmail: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${req.query.email}'`
      );
      let token = generateConfirmationToken(req.query.email)
      let link = `${urls.frontendUrl}/api/verifyEmail?email=${token}`
      sendEmail(
        user[0][0].username,
        req.query.email,
        "Please Verify Your Account",
        verifyEmailTemplate(user[0][0].username, token, link)
      );
      res.status(200)
    } catch (error) {
      console.log(error);
      ErrorHandler("sendVerifyEmail Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
export default Authentication;
