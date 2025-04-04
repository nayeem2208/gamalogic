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
import hmacDigestFunction from "../utils/HMACDigest.js";

const Authentication = {
  sample: async (req, res) => {
    ///its for checking purpose
    try {
      let source = 'Sign in'
      leadGeneration('BCOS', 'Healthcare', 'info@bcoshealthcare.com', source, req)
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
  samplePost: async (req, res) => {
    ///its for checking purpose
    try {
      console.log(req.body, 'req.body')
      // ErrorHandler("webhook checker", req.body, req);
      res.send({ success: true })
    } catch (error) {
      // ErrorHandler("Sample Controller", error, req);
      console.log(error)
    }
  },
  proxyServer: async (req, res) => {
    try {
      const { resourceUrl } = req.query;
      const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });
      res.set('Content-Type', response.headers['content-type']);
      res.send(response.data);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error fetching the image' });
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
          let token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
          let creditBal;
          let finalFree = new Date(user[0][0].free_final);
          let finalFreeDate = new Date(finalFree);
          let currentDate = new Date();
          let expired = null
          if (user[0][0].is_premium == 0 && user[0][0].confirmed == 1) {
            if (user[0][0].credits <= 0) {
              if (finalFree < currentDate) {
                expired = {
                  status: true,
                  reason: 'date'
                }
              }
              else if (user[0][0].credits_free <= 0) {
                expired = {
                  status: true,
                  reason: 'credit'
                }
              }
            }
          }
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

          const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)
          const userAgent = req.headers["user-agent"];
          let dateOfLogin = new Date().toISOString().split('T')[0];
          let timeOfLogin = new Date().toISOString().split('T')[1].split('.')[0];
          await dbConnection.query(`INSERT INTO  last_login (user_id, date,time,ip,referer)VALUES(?, ?, ?, ?, ?)`, [user[0][0].rowid, dateOfLogin, timeOfLogin, ip, userAgent])
          let accountDetailsModal = false
          if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
            !user[0][0].phone_number ||
            (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
            (user[0][0].is_company == 1 && !user[0][0].company_name) ||
            !user[0][0].address_line_1 ||
            !user[0][0].city ||
            !user[0][0].pincode ||
            !user[0][0].country ||
            !user[0][0].state) && user[0][0].is_premium == 1) {
            accountDetailsModal = true
          }
          let accountDetailsModalInBuyCredits = false
          if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
            !user[0][0].phone_number ||
            (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
            (user[0][0].is_company == 1 && !user[0][0].company_name) ||
            !user[0][0].address_line_1 ||
            !user[0][0].city ||
            !user[0][0].pincode ||
            !user[0][0].country ||
            !user[0][0].state) && user[0][0].is_premium != 1) {
            accountDetailsModalInBuyCredits = true
          }


          // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
          // const { country_name } = response.data;
          let TeamAdminEmail
          if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
            let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
            TeamAdminEmail = TeamAdmin[0][0].emailid
          }
          let AppTour = null
          if (user[0][0].app_tour != 1) {
            AppTour = {
              tour: true,
              showTour: false
            }
          }
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: creditBal,
            token,
            confirm: user[0][0].confirmed,
            password,
            country_name: 'USA',
            expired,
            HMACDigest,
            id: user[0][0].rowid,
            accountDetailsModal,
            accountDetailsModalInBuyCredits,
            isTeam: user[0][0].is_team_admin,
            isTeamMember: user[0][0].is_team_member,
            isTeamid: TeamAdminEmail,
            timeZone: user[0][0].time_zone,
            AppTour

          });

        } else {
          res.status(401).json({ error: "Incorrect password" });
        }
      } else {
        res.status(401).json({ error: "Invalid User" });
      }
    } catch (error) {
      console.log(error)
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      let invitedUserId = null
      console.log(req.body.teamId, 'team id is here')
      const userAgent = req.headers["user-agent"];
      let ip = req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';

      const dbConnection = req.dbConnection;
      let userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (req.body.teamId) {
        const decoded = jwt.verify(req.body.teamId, process.env.JWT_SECRET);
        const { userEmail, teamIds } = decoded;
        const [validLink] = await dbConnection.query(
          `SELECT * FROM team_member_invite WHERE emailaddress = ? AND (is_deleted IS NULL OR is_deleted = 0)`,
          [userEmail]
        );
        if (email != userEmail) {
          res.status(401).json({ error: "Email address does not match the invitation" });
          return;
        }

        if (!validLink || validLink.length == 0) {
          res.status(401).json({ error: "Email address is not invited or the invitation has been removed" });
          return;
        }

        invitedUserId = teamIds
        try {
          await dbConnection.query(
            `UPDATE team_member_invite set is_member=1 WHERE emailaddress = '${userEmail}'`
          );
          console.log('Invite successfully deleted');
        } catch (error) {
          console.error('Error deleting invite:', error);
        }
      }
      if (userExists[0].length > 0) {
        res.status(401).json({ error: "User already exists" });
      } else {
        const response = await axios.get(
          `https://gamalogic.com/emailvrf/?emailid=${email}&apikey=${process.env.SIGNUP_API_KEY}&speed_rank=0`
        );
        if (response.data && response.data.gamalogic_emailid_vrfy) {
          console.log(response.data.gamalogic_emailid_vrfy[0].is_disposable, 'is disposible')
          if (response.data.gamalogic_emailid_vrfy[0].is_disposable) {
            return res.status(401).json({ error: "Disposable email addresses are not allowed for registration." });
          }
        }
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': process.env.THRIVE_BRAND_SECRET,
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
            console.log(response, 'response of registration')
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
        let referenceCode = req.body.thriveRefId != null ? req.body.thriveRefId : null
        let isReferedBy = req.body.thriveRefId != null ? 1 : 0
        let source = req.body.thriveRefId != null ? 'Affiliate Referrer' : 'Sign in'
        let isTeamMember = invitedUserId ? 1 : 0
        let teamId = invitedUserId ? invitedUserId : null
        await dbConnection.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium,firstname,lastname,is_referer_by,referer_by,is_team_member,team_id)VALUES(null,'${fullname}','${email}','${hashedPassword}','${formattedDate}',0,'${freeFinalDate}',0,0,'${ip}','${userAgent}',0,0,'${firstname}','${lastname}','${isReferedBy}','${referenceCode}','${isTeamMember}','${teamId}')`
        );
        try {
          leadGeneration(firstname, lastname, email, source, req)
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
      console.log(error)
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
        const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
        let creditBal;
        let finalFree = new Date(user[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        let expired = null
        if (user[0][0].is_premium == 0 && user[0][0].confirmed == 1) {
          if (user[0][0].credits <= 0) {
            if (finalFree < currentDate) {
              expired = {
                status: true,
                reason: 'date'
              }
            }
            else if (user[0][0].credits_free <= 0) {
              expired = {
                status: true,
                reason: 'credit'
              }
            }
          }
        }
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

        const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)
        const userAgent = req.headers["user-agent"];
        let dateOfLogin = new Date().toISOString().split('T')[0];
        let timeOfLogin = new Date().toISOString().split('T')[1].split('.')[0];
        await dbConnection.query(`INSERT INTO  last_login (user_id, date,time,ip,referer)VALUES(?, ?, ?, ?, ?)`, [user[0][0].rowid, dateOfLogin, timeOfLogin, ip, userAgent])
        let accountDetailsModal = false
        if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
          !user[0][0].phone_number ||
          (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
          (user[0][0].is_company == 1 && !user[0][0].company_name) ||
          !user[0][0].address_line_1 ||
          !user[0][0].city ||
          !user[0][0].pincode ||
          !user[0][0].country ||
          !user[0][0].state) && user[0][0].is_premium == 1) {
          accountDetailsModal = true
        }
        let accountDetailsModalInBuyCredits = false
        if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
          !user[0][0].phone_number ||
          (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
          (user[0][0].is_company == 1 && !user[0][0].company_name) ||
          !user[0][0].address_line_1 ||
          !user[0][0].city ||
          !user[0][0].pincode ||
          !user[0][0].country ||
          !user[0][0].state) && user[0][0].is_premium != 1) {
          accountDetailsModalInBuyCredits = true
        }


        // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        // const { country_name } = response.data;

        let TeamAdminEmail
        if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
          let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
          TeamAdminEmail = TeamAdmin[0][0].emailid
        }
        let AppTour = null
        if (user[0][0].app_tour != 1) {
          AppTour = {
            tour: true,
            showTour: false
          }
        }
        res.status(200).json({
          name: user[0][0].username,
          email: user[0][0].emailid,
          firstname: user[0][0].firstname || null,
          lastname: user[0][0].lastname || null,
          credit: creditBal,
          token,
          confirm: 1,
          password,
          country_name: 'USA',
          expired,
          HMACDigest,
          id: user[0][0].rowid,
          accountDetailsModal,
          accountDetailsModalInBuyCredits,
          isTeam: user[0][0].is_team_admin,
          isTeamMember: user[0][0].is_team_member,
          isTeamid: TeamAdminEmail,
          timeZone: user[0][0].time_zone,
          AppTour
        });
      } else {
        res.status(400).json({
          error:
            "Unauthorised Access, Please register with us",
        });
      }
    } catch (error) {
      console.log(error)
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
      let invitedUserId = null

      const userExists = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (userExists[0].length > 0) {
        res.status(400).json({ error: "User already exists" });
      } else {
        console.log(req.body.widgetCode, req.body.thriveRefId, 'widget and refidddddd')
        if (req.body.teamId) {
          const decoded = jwt.verify(req.body.teamId, process.env.JWT_SECRET);
          const { userEmail, teamIds } = decoded;
          const [validLink] = await dbConnection.query(
            `SELECT * FROM team_member_invite WHERE emailaddress = ? AND (is_deleted IS NULL OR is_deleted = 0)`,
            [userEmail]
          );
          if (email != userEmail) {
            res.status(401).json({ error: "Email address does not match the invitation" });
            return;
          }

          if (!validLink || validLink.length == 0) {
            res.status(401).json({ error: "Email address is not invited or the invitation has been removed" });
            return;
          }

          invitedUserId = teamIds
          try {
            await dbConnection.query(
              `UPDATE team_member_invite SET is_member=1 WHERE emailaddress = '${userEmail}'`
            );
            console.log('Invite successfully deleted');
          } catch (error) {
            console.error('Error deleting invite:', error);
          }
        }
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': process.env.THRIVE_BRAND_SECRET,
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
        let referenceCode = req.body.thriveRefId != null ? req.body.thriveRefId : null
        let isReferedBy = req.body.thriveRefId != null ? 1 : 0
        let source = req.body.thriveRefId != null ? 'Affiliate Referrer' : 'Sign in'
        let isTeamMember = invitedUserId ? 1 : 0
        let deletedUser = await dbConnection.query('SELECT * from registration_deleted where emailid=?', [email])
        let creditFree
        if (deletedUser[0].length > 0) {
          creditFree = 0
        }
        else if (invitedUserId) {
          creditFree = 0
        }
        else {
          creditFree = 500
        }
        await dbConnection.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,session_google,is_premium,firstname,lastname,is_referer_by,referer_by,is_team_member,team_id)VALUES(null,'${name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,'${creditFree}','${ip}','${userAgent}',1,0,'${firstname}','${lastname}','${isReferedBy}','${referenceCode}','${isTeamMember}','${invitedUserId}')`
        );
        try {
          leadGeneration(firstname, lastname, email, source)
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
          const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
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
          const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)

          // const response = await axios.get(`https://ipapi.co/${ip}/json/`);
          // const { country_name } = response.data;
          let TeamAdminEmail
          if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
            let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
            TeamAdminEmail = TeamAdmin[0][0].emailid
          }
          let AppTour = {
            tour: true,
            showTour: false
          }
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: 500,
            token,
            confirm: 1,
            password,
            country_name: 'USA',
            HMACDigest,
            id: user[0][0].rowid,
            isTeamMember: user[0][0].is_team_member,
            isTeamid: TeamAdminEmail,
            accountDetailsModalInBuyCredits: true,
            timeZone: user[0][0].time_zone,
            AppTour
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
      const { code, widgetCode, thriveRefId } = req.body;

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
                'thrive-secret-hash': process.env.THRIVE_BRAND_SECRET,
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
            let referenceCode = thriveRefId != null ? thriveRefId : null
            let isReferedBy = thriveRefId != null ? 1 : 0
            let source = thriveRefId != null ? 'Affiliate Referrer' : 'Sign in'
            await dbConnection.query(
              `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,is_linkedin,is_premium,firstname,lastname,is_referer_by,referer_by)VALUES(null,'${given_name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,500,'${ip}','${userAgent}',1,0,'${firstname}','${lastname}','${isReferedBy}','${referenceCode}')`
            );
            try {
              leadGeneration(firstname, lastname, email, source)
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
              const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
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

              const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)

              res.json({
                name: user[0][0].username,
                email: user[0][0].emailid,
                firstname: user[0][0].firstname || null,
                lastname: user[0][0].lastname || null,
                credit: 500,
                token,
                confirm: 1,
                password,
                HMACDigest,
                id: user[0][0].rowid
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
        // const getAccessToken = async (url, retries = 3, delay = 5000) => {
        //   for (let i = 0; i < retries; i++) {
        //     try {
        //       let accessTokenResponse = await axios.get(url);
        //       return accessTokenResponse.data;
        //     } catch (error) {
        //       if (i === retries - 1) throw error;
        //       await new Promise(resolve => setTimeout(resolve, delay));
        //     }
        //   }
        // };
        const getAccessToken = async (url, retries = 3, delay = 5000) => {
          for (let i = 0; i < retries; i++) {
            try {
              const response = await axios.post(url, null, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              });
              return response.data;
            } catch (error) {
              if (i === retries - 1) throw error;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        };
        const accessTokenData = await getAccessToken(accessTokenUrl);
        if (!accessTokenData || !accessTokenData.access_token) {
          throw new Error('Failed to obtain access token');
        }
        // const accessTokenData = await getAccessToken(accessTokenUrl);
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
            const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
            let creditBal;
            let finalFree = new Date(user[0][0].free_final);
            let finalFreeDate = new Date(finalFree);
            let currentDate = new Date();
            let expired
            if (user[0][0].is_premium == 0 && user[0][0].confirmed == 1) {
              if (finalFree < currentDate) {
                expired = {
                  status: true,
                  reason: 'date'
                }
              }
              else if (user[0][0].credits_free <= 0) {
                expired = {
                  status: true,
                  reason: 'credit'
                }
              }
            }
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
            const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)
            const userAgent = req.headers["user-agent"];
            let dateOfLogin = new Date().toISOString().split('T')[0];
            let timeOfLogin = new Date().toISOString().split('T')[1].split('.')[0];
            await dbConnection.query(`INSERT INTO  last_login (user_id, date,time,ip,referer)VALUES(?, ?, ?, ?, ?)`, [user[0][0].rowid, dateOfLogin, timeOfLogin, ip, userAgent])
            let accountDetailsModal = false
            if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
              !user[0][0].phone_number ||
              (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
              (user[0][0].is_company == 1 && !user[0][0].company_name) ||
              !user[0][0].address_line_1 ||
              !user[0][0].city ||
              !user[0][0].pincode ||
              !user[0][0].country ||
              !user[0][0].state) && user[0][0].is_premium == 1) {
              accountDetailsModal = true
            }

            let TeamAdminEmail
            if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
              let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
              TeamAdminEmail = TeamAdmin[0][0].emailid
            }
            res.status(200).json({
              name: user[0][0].username,
              email: user[0][0].emailid,
              firstname: user[0][0].firstname || null,
              lastname: user[0][0].lastname || null,
              credit: creditBal,
              token,
              confirm: 1,
              password,
              country_name: 'India',
              expired,
              HMACDigest,
              id: user[0][0].rowid,
              accountDetailsModal,
              isTeam: user[0][0].is_team_admin,
              isTeamMember: user[0][0].is_team_member,
              isTeamid: TeamAdminEmail
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
      let email = req.body.mail ?? req.body.userPrincipalName
      let invitedUserId = null
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
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
        if (req.body.teamId) {
          const decoded = jwt.verify(req.body.teamId, process.env.JWT_SECRET);
          const { userEmail, teamIds } = decoded;
          const [validLink] = await dbConnection.query(
            `SELECT * FROM team_member_invite WHERE emailaddress = ? AND (is_deleted IS NULL OR is_deleted = 0)`,
            [userEmail]
          );
          if (email != userEmail) {
            res.status(401).json({ error: "Email address does not match the invitation" });
            return;
          }

          if (!validLink || validLink.length == 0) {
            res.status(401).json({ error: "Email address is not invited or the invitation has been removed" });
            return;
          }

          invitedUserId = teamIds
          try {
            await dbConnection.query(
              `UPDATE team_member_invite SET is_member=1 WHERE emailaddress = '${userEmail}'`
            );
            console.log('Invite successfully deleted');
          } catch (error) {
            console.error('Error deleting invite:', error);
          }
        }
        if (req.body.widgetCode && req.body.thriveRefId) {
          const url = `https://thrive.zoho.com/thrive/webhooks/${req.body.widgetCode}/mapreferral`;

          const headers = {
            'thrive-secret-hash': process.env.THRIVE_BRAND_SECRET,
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
            ErrorHandler("Microsoft Auth Controller Thrive signin section", error, req);
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
        let referenceCode = req.body.thriveRefId != null ? req.body.thriveRefId : null
        let isReferedBy = req.body.thriveRefId != null ? 1 : 0
        let source = req.body.thriveRefId != null ? 'Affiliate Referrer' : 'Sign in'
        let isTeamMember = invitedUserId ? 1 : 0
        let deletedUser = await dbConnection.query('SELECT * from registration_deleted where emailid=?', [email])
        let creditFree
        if (deletedUser[0].length > 0) {
          creditFree = 0
        }
        else if (invitedUserId) {
          creditFree = 0
        }
        else {
          creditFree = 500
        }

        await dbConnection.query(
          `INSERT INTO registration(rowid,username,emailid,password,registered_on,confirmed,confirmed_on,api_key,free_final,credits,credits_free,ip_address,user_agent,is_microsoft,is_premium,firstname,lastname,is_referer_by,referer_by,is_team_member,team_id)VALUES(null,'${given_name}','${email}',0,'${formattedDate}',1,'${formattedDate}','${apiKey}','${freeFinalDate}',0,'${creditFree}','${ip}','${userAgent}',1,0,'${firstname}','${lastname}','${isReferedBy}','${referenceCode}','${isTeamMember}','${invitedUserId}')`
        );
        try {
          leadGeneration(firstname, lastname, email, source)
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
          const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
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
          const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)

          let TeamAdminEmail
          if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
            let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
            TeamAdminEmail = TeamAdmin[0][0].emailid
          }

          let AppTour = {
            tour: true,
            showTour: false
          }
          res.json({
            name: user[0][0].username,
            email: user[0][0].emailid,
            firstname: user[0][0].firstname || null,
            lastname: user[0][0].lastname || null,
            credit: 500,
            token,
            confirm: 1,
            password,
            HMACDigest,
            id: user[0][0].rowid,
            isTeamMember: user[0][0].is_team_member,
            isTeamid: TeamAdminEmail,
            accountDetailsModalInBuyCredits: true,
            timeZone: user[0][0].time_zone,
            AppTour
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
      let email = req.body.mail ?? req.body.userPrincipalName
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      let user = await dbConnection.query(
        `SELECT * FROM registration WHERE emailid='${email}'`
      );
      if (user[0].length > 0) {
        const token = generateToken(res, user[0][0].rowid, user[0][0].api_key, user[0][0].team_id);
        let creditBal;
        let finalFree = new Date(user[0][0].free_final);
        let finalFreeDate = new Date(finalFree);
        let currentDate = new Date();
        let expired = null
        if (user[0][0].is_premium == 0 && user[0][0].confirmed == 1) {
          if (user[0][0].credits <= 0) {
            if (finalFree < currentDate) {
              expired = {
                status: true,
                reason: 'date'
              }
            }
            else if (user[0][0].credits_free <= 0) {
              expired = {
                status: true,
                reason: 'credit'
              }
            }
          }
        }
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
        const HMACDigest = hmacDigestFunction(user[0][0].emailid, user[0][0].rowid)
        const userAgent = req.headers["user-agent"];
        let dateOfLogin = new Date().toISOString().split('T')[0];
        let timeOfLogin = new Date().toISOString().split('T')[1].split('.')[0];
        await dbConnection.query(`INSERT INTO  last_login (user_id, date,time,ip,referer)VALUES(?, ?, ?, ?, ?)`, [user[0][0].rowid, dateOfLogin, timeOfLogin, ip, userAgent])
        let accountDetailsModal = false
        if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
          !user[0][0].phone_number ||
          (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
          (user[0][0].is_company == 1 && !user[0][0].company_name) ||
          !user[0][0].address_line_1 ||
          !user[0][0].city ||
          !user[0][0].pincode ||
          !user[0][0].country ||
          !user[0][0].state) && user[0][0].is_premium == 1) {
          accountDetailsModal = true
        }
        let accountDetailsModalInBuyCredits = false
        if ((!user[0][0].title || !user[0][0].firstname || !user[0][0].phone_country_code ||
          !user[0][0].phone_number ||
          (!user[0][0].is_company == 1 && !user[0][0].is_personal == 1) ||
          (user[0][0].is_company == 1 && !user[0][0].company_name) ||
          !user[0][0].address_line_1 ||
          !user[0][0].city ||
          !user[0][0].pincode ||
          !user[0][0].country ||
          !user[0][0].state) && user[0][0].is_premium != 1) {
          accountDetailsModalInBuyCredits = true
        }
        let TeamAdminEmail
        if (user[0][0].team_id !== null && user[0][0].team_id !== 'null' && user[0][0].team_id) {
          let TeamAdmin = await dbConnection.query(`SELECT emailid from registration where rowid='${user[0][0].team_id}'`)
          TeamAdminEmail = TeamAdmin[0][0].emailid
        }
        let AppTour = null
        if (user[0][0].app_tour != 1) {
          AppTour = {
            tour: true,
            showTour: false
          }
        }
        res.status(200).json({
          name: user[0][0].username,
          email: user[0][0].emailid,
          firstname: user[0][0].firstname || null,
          lastname: user[0][0].lastname || null,
          credit: creditBal,
          token,
          confirm: 1,
          password,
          country_name: 'India',
          expired,
          HMACDigest,
          id: user[0][0].rowid,
          accountDetailsModal,
          accountDetailsModalInBuyCredits,
          isTeam: user[0][0].is_team_admin,
          isTeamMember: user[0][0].is_team_member,
          isTeamid: TeamAdminEmail,
          timeZone: user[0][0].time_zone,
          AppTour

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
      const isTeamMember = await dbConnection.query(
        `SELECT team_id FROM registration WHERE emailid='${userEmail}'`
      );
      let apiKey = await generateUniqueApiKey(req);
      let confirmedDate = new Date();
      if (isTeamMember[0][0] && (isTeamMember[0][0].team_id !== null && isTeamMember[0][0].team_id !== 'null' && isTeamMember[0][0].team_id)) {
        const query = `UPDATE registration SET confirmed = 1 ,confirmed_on=? ,api_key=?,referer=? WHERE emailid = ?`;
        await dbConnection.query(query, [confirmedDate, apiKey, referer, userEmail]);
      }
      else {
        let deletedUser = await dbConnection.query('SELECT * from registration_deleted where emailid=?', [userEmail])
        let creditFree
        if (deletedUser[0].length > 0) {
          creditFree = 0
        }
        else {
          creditFree = 500
        }
        const query = `UPDATE registration SET confirmed = 1 ,confirmed_on=? ,api_key=?,referer=?, credits_free=?  WHERE emailid = ?`;
        await dbConnection.query(query, [confirmedDate, apiKey, referer, creditFree, userEmail]);
      }
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
        ErrorHandler("verify Account Email Controller", error, req);
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
