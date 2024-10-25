import urls from "../ConstFiles/urls.js";
import verifyCancelSubscriptionTemplate from "../EmailTemplates/verfiyCancelSubscriptionTemplate.js";
import subscriptionCancelConfirmationToken from "../utils/cancelSubscriptionToken.js";
import ErrorHandler from "../utils/errorHandler.js"
import sendEmail from "../utils/zeptoMail.js";
import jwt from "jsonwebtoken";


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
          const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
          const userEmail = decoded.email;
      
          console.log(userEmail, 'Token successfully decoded');
            
          res.redirect(`${urls.frontendUrl}/cancelSubscriptionConfirmation`);
        } catch (error) {
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