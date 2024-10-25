import axios from "axios";
import urls from "../ConstFiles/urls.js";
import verifyCancelSubscriptionTemplate from "../EmailTemplates/verfiyCancelSubscriptionTemplate.js";
import subscriptionCancelConfirmationToken from "../utils/cancelSubscriptionToken.js";
import ErrorHandler from "../utils/errorHandler.js"
import sendEmail from "../utils/zeptoMail.js";
import jwt from "jsonwebtoken";
import basicTemplate from "../EmailTemplates/BasicTemplate.js";
import Razorpay from "razorpay";



const newControllers = {
    cancelSubscription: async (req, res) => {
        try {
            console.log(req.user[0][0], 'user')
            let token = subscriptionCancelConfirmationToken(req.user[0][0].emailid)
            console.log(token, 'token')
            let link = `${urls.frontendUrl}/api/ConfirmSubscriptionCancellation?email=${token}`
            sendEmail(
                req.user[0][0].username,
                req.user[0][0].emailid,
                "Subscription Cancellation Verification ",
                verifyCancelSubscriptionTemplate(req.user[0][0].username, token, link)
            );
            res.status(200).json({ status: 'success' })
        } catch (error) {
            console.log(error)
            // ErrorHandler("cancel subscription Controller", error, req)
        }
    },
    verifyCancelSubscription: async (req, res) => {
      try {
          const dbConnection = req.dbConnection;
          const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
          const userEmail = decoded.email;
          let user = await dbConnection.query(`SELECT * FROM registration where emailid='${userEmail}'`)
          let planDetails = {}
          if (user[0][0].is_premium == 1 && (user[0][0].is_monthly == 1 || user[0][0].is_annual == 1)) {
              let paypalSub = await dbConnection.query(`
              SELECT * FROM paypal_subscription 
              WHERE userid='${user[0][0].rowid}' 
              ORDER BY id DESC
            `);

              let razorPaySub = await dbConnection.query(`
              SELECT * FROM razorpay_subscription 
              WHERE customer_id='${user[0][0].rowid}' 
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
          if (planDetails.source == 'paypal') {

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

              const payPaldetails = await axios.post(`${urls.paypalUrl}/v1/billing/subscriptions/${planDetails.subscription_id}/cancel`, { reason: 'No specific reason' }, {
                  headers: {
                      'Authorization': `Bearer ${payPalToken.data.access_token}`
                  }
              });

              let stopTime = new Date().toISOString()
              await dbConnection.query(
                  `UPDATE registration SET is_active=0, subscription_stop_time = ? WHERE rowid = ?`,
                  [stopTime, user[0][0].rowid]
              );
          }
          else if (planDetails.source == 'razorpay') {
              var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET })
              let resp = await instance.subscriptions.cancel(planDetails.subscription_id)
              console.log(resp,'resp')
          }


          let isMonthlyInEmail = planDetails.is_monthly == 1 ? 'Monthly' : 'Annual'
              let content
              if (planDetails.is_monthly == 1) {
                  content = `
                <p>We're sorry to see you go! Your monthly subscription has been successfully cancelled.</p>
                
                <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
        
                <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
                `
              } else if (planDetails.is_annual == 1) {
                  content = `
                <p>We're sorry to see you go! Your annual subscription has been successfully cancelled.</p>
                
                <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
        
                <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
                `
              }
              let sub = `Gamalogic ${isMonthlyInEmail} Subscription Cancellation`
              sendEmail(
                  user[0][0].username,
                  user[0][0].emailid,
                  sub,
                  basicTemplate(user[0][0].username, content)
              );


          res.redirect(`${urls.frontendUrl}/cancelSubscriptionConfirmation`);
      } catch (error) {
          console.log(error)
          if (error.name === 'TokenExpiredError') {
              console.error('Token has expired');
              res.redirect(`${urls.frontendUrl}/cancelSubscriptionError?error=expired`);
          } else if (error.name === 'JsonWebTokenError') {
              console.error('Invalid token');
              res.redirect(`${urls.frontendUrl}/cancelSubscriptionError?error=invalid`);
          } else {
              console.error('An error occurred:', error);
              res.redirect(`${urls.frontendUrl}/cancelSubscriptionError?error=generic`);
          }
      }
  },
      
}
export default newControllers