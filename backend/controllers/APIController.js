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
      console.log('getApi end')
      if (req.dbConnection) {
        await req.dbConnection.release();
      }
    }

  },
  emailValidation: async (req, res) => {
    try {
      if (!req.body.email || typeof req.body.email !== 'string') {
        return res.status(400).json({ error: "Invalid email provided" });
      }

      if (!req.user || !req.user.api_key) {
        return res.status(403).json({ error: "API key not found or user not authenticated" });
      }

      let apiKey = req.user.api_key;
      const response = await axios.get(
        `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${apiKey}&speed_rank=0`
      );
      if (response.data && response.data.gamalogic_emailid_vrfy) {
        res.status(200).json(response.data.gamalogic_emailid_vrfy[0]);
      } else {
        res.status(500).json({ error: "Unexpected response from email validation service" });
      }
    } catch (error) {
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
      let apiKey = req.user.api_key;
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
        let files = await dbConnection.query(
          `SELECT * FROM useractivity_batch_link WHERE userid='${req.user[0][0].rowid}' ORDER BY date_time DESC LIMIT 5 OFFSET ${(req.query.page - 1) * 5};`
        );
        res.status(200).json(files[0]);
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
          `https://gamalogic.com/batchemailvrf?apikey=${apiKey}&speed_rank=0&file_name=${fileName}`,
          data
        );
        if (response.data.error !== undefined && response.data.error == false) {
          let files = await dbConnection.query(`SELECT * FROM useractivity_batch_link where id='${response.data["batch id"]}'`)
          let content = `<p>This is to inform you that the batch email verification process for the file ${fileName} has been started.</p>
        <p>Please note that the verification process may take some time depending on the size of the file and the number of emails to be verified.</p>
        <p>Thank you for using our service.</p>
        <div class="verify">
        <a href="${urls.frontendUrl}/dashboard/file-upload"><button
                class="verifyButton">Download</button></a>

        </div>`
          sendEmail(
            req.user[0][0].username,
            req.user[0][0].emailid,
            "Batch Email Verification Started",
            basicTemplate(req.user[0][0].username, content)
          );
          res.status(200).json({ message: response.data.message, files: files[0][0] });
        } else {
          const errorMessage = Object.values(response.data)[0];
          let errorREsponse = await ErrorHandler("batchEmailValidation Controller", errorMessage, req);
          res.status(400).json({ error: errorMessage, errorREsponse });
        }
      } else {
        res.status(400).json({ error: 'You dont have enough to do this' });
      }
    } catch (error) {
      console.log(error);
      let errorREsponse = await ErrorHandler("batchEmailValidation Controller", error, req);
      res.status(500).json({ error: "Internal Server Error", errorREsponse });
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
        `https://gamalogic.com/batchstatus/?apikey=${apiKey}&batchid=${req.query.id}`
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
        `https://gamalogic.com/batchresult/?apikey=${apiKey}&batchid=${req.query.batchId}`
      );
      let fileName = await req.dbConnection.query(`SELECT file_upload from useractivity_batch_link where id='${req.query.batchId}'`)
      res.status(200).json({ datas: download.data, fileName: fileName[0][0].file_upload });
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
      let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where userid='${req.user[0][0].rowid}' ORDER BY date_time DESC LIMIT 5 OFFSET ${(req.query.page - 1) * 5};`)
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
          `https://gamalogic.com/batch-email-discovery/?apikey=${apiKey}&file_name=${req.body.fileName}`,
          data
        );
        if (response.data.error !== undefined && response.data.error == false) {
          let files = await dbConnection.query(`SELECT * FROM useractivity_batch_finder_link where id='${response.data["batch id"]}'`)
          let content = `<p>This is to inform you that the batch email finder process for the file ${req.body.fileName} has been started.</p>
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
          res.status(200).json({ message: response.data.message, files: files[0][0] });
        }
        else {
          const errorMessage = Object.values(response.data)[0];
          let errorREsponse = await ErrorHandler("batchEmailFinder Controller", errorMessage, req);
          res.status(400).json({ error: errorMessage, errorREsponse });
        }
      } else {
        res.status(400).json({ error: 'You dont have enough to do this' });
      }
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
  batchEmailFinderStatus: async (req, res) => {
    try {
      let apiKey = req.user.api_key;
      let emailStatus = await axios.get(
        `https://gamalogic.com/batch-email-discovery-status/?apikey=${apiKey}&batchid=${req.query.id}`
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
        `https://gamalogic.com/batch-email-discovery-result/?apikey=${apiKey}&batchid=${req.query.batchId}`
      );
      let fileName = await req.dbConnection.query(`SELECT file_upload from useractivity_batch_finder_link where id='${req.query.batchId}'`)
      res.status(200).json({ datas: download.data, fileName: fileName[0][0].file_upload });
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

  PayPalUpdateCredit: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits from registration WHERE emailid='${req.user[0][0].emailid}'`)
      let newBalance = user[0][0].credits + req.body.credits
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)

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
              paypal_fee, net_amount, gross_amount, gross_currency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        details?.purchase_units?.[0]?.payments?.captures?.[0]?.seller_receivable_breakdown?.gross_amount?.currency_code ?? null
      ];


      await dbConnection.query(query, values);
      updateLeadStatus(req.user[0][0].emailid)
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
      console.log(req.body, 'req. bodyyyyyyyyyy')
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
      let isMonthlyInEmail=paymentDetails.period === 'monthly'?'Monthly':'Annual'
      let sub=`Gamalogic ${isMonthlyInEmail} Subscription Payment successful`
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
      const registrationRuery = `
  UPDATE registration 
  SET credits = '${newBalance}', 
      is_premium = 1, 
      ${periodColumn} = 1 ,
      subscription_start_time='${details.start_time}',
      last_payment_time='${details.billing_info.last_payment.time}',
      is_active=1,
      is_pay_as_you_go=0
  WHERE emailid = '${user.emailid}'
`;

      await dbConnection.query(registrationRuery);

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
        name, address, email_address, payer_id, last_payment, next_billing_time,is_active
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
        1
      ];
      updateLeadStatus(req.user[0][0].emailid)

      await dbConnection.query(query, values);
      res.status(200).json('Successfull')
      dbConnection.release()
    } catch (error) {
      console.log(error);
      ErrorHandler("Paypal subscription Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
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

        const foundItem = paypalPrice.find(([credits, id,planPeriod]) => id === payPaldetails.data.plan_id);
        let credit = foundItem ? foundItem[0] : null;

        let planInDataBase = await dbConnection.query(`SELECT * FROM paypal_subscription WHERE subscription_id = '${payPaldetails.data.id}' ORDER BY id DESC 
          LIMIT 1`);
        if (event_type === 'PAYMENT.SALE.COMPLETED') {
          if (planInDataBase[0].length > 0) {
            console.log('inside plan base')
            const existingEntry = planInDataBase[0][0];
            const existingEntryCreationDate = new Date(existingEntry.start_time).toISOString().split('T')[0]; // Extract date part
            const currentDate = new Date().toISOString().split('T')[0];
            let isSameDay = existingEntryCreationDate === currentDate

            let time_stamp = new Date().toISOString().split('T')[0] === new Date(existingEntry.time_stamp).toISOString().split('T')[0]

            if (!isSameDay && !time_stamp) {
              console.log('inside sameday')
              ErrorHandler("update paypal webhook checker step 1", req.body, req);
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
              console.log(paymentDetails, 'ismonthly')
              let query = `
                 INSERT INTO paypal_subscription (
                userid, credits, is_monthly, is_annual,gross_amount, subscription_id, plan_id, start_time, quantity,
                name, address, email_address, payer_id, last_payment, next_billing_time,is_active,time_stamp
              ) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
              `;

              let values = [
                planInDataBase[0][0].userid ?? null,
                paymentDetails[0] ?? null,
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
                1,
                new Date().toISOString()
              ];
              // console.log('ivda vare ellam sheri aaahn')

              await dbConnection.query(query, values);
              let user = await dbConnection.query(`SELECT username,emailid,credits FROM registration WHERE rowid = '${planInDataBase[0][0].userid}'`);
              let newBalance = user[0][0].credits + credit;

              await dbConnection.query(`UPDATE registration SET credits = '${newBalance}', is_premium = 1 WHERE rowid = '${planInDataBase[0][0].userid}'`);
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
              let isMonthlyInEmail=paymentDetails[2] == 'monthly'?'Monthly':'Annual'  
              let sub=`Gamalogic ${isMonthlyInEmail} Subscription Payment successful`
              sendEmail(
                user[0][0].username,         
                user[0][0].emailid,
                sub,
                basicTemplate(user[0][0].username, content)
              );
            } else {
              ErrorHandler("update paypal webhook checker step 2", req.body, req);
              console.log('Dates are the same. No update needed.');
            }

          } else {
            console.log('No record found in database for the given plan_id.');
          }
        } else if (event_type == 'BILLING.SUBSCRIPTION.CANCELLED') {
          console.log('inside cancellation part')
          //handling the subscription cancellation part
          
          await dbConnection.query(
            `UPDATE registration SET is_monthly = 0, is_annual = 0,is_active=0, subscription_stop_time = ? WHERE rowid = ?`,
            [resource.create_time, planInDataBase[0][0].userid]
          );
          let data = paypalPrice.find(([credit, id,period]) => id == resource.plan_id)
          let isMonthlyInEmail=data[2] == 'monthly'?'Monthly':'Annual'  
          let content
          if(data[2] == 'monthly'){
            content = `
            <p>We're sorry to see you go! Your monthly subscription has been successfully cancelled.</p>
            
            <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
    
            <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
            `
          }else{
            content = `
            <p>We're sorry to see you go! Your annual subscription has been successfully cancelled.</p>
            
            <p>If you have any questions or need assistance with your account, please don't hesitate to reach out.</p>
    
            <p>Thank you for choosing us, and we hope to serve you again in the future!</p>
            `
          }
          let user = await dbConnection.query(`SELECT * from registration WHERE rowid='${planInDataBase[0][0].userid}'`)
          let sub=`Gamalogic ${isMonthlyInEmail} Subscription Cancellation`
          sendEmail(
            user[0][0].username,
            user[0][0].emailid,
            sub,
            basicTemplate(user[0][0].username, content)
          );

        }
        else{
          console.log('inside else part not cancellation or updation')
        }
      }
      res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
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
  },
  razorPayPaymentSuccess: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits from registration WHERE emailid='${req.user[0][0].emailid}'`)

      let newBalance = user[0][0].credits + req.body.credits
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,is_pay_as_you_go=1 WHERE emailid='${req.user[0][0].emailid}'`)

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
      error_reason, bank_transaction_id, created_at,payment_id
    ) VALUES ( ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
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
        id
      ];

      await dbConnection.query(query, values);

      let content = `
      <p>Thanks for choosing Gamalogic</p>
      <p>Your payment for ₹${Math.round(req.body.cost)} for ${Number(req.body.credits).toLocaleString()} credits has been successfully processed.</p>
            `
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      updateLeadStatus(req.user[0][0].emailid)
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
          console.log('its reaching here')
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
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1,${periodColumn} = 1 ,subscription_start_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',
      last_payment_time='${new Date(subscriptinDetails.created_at * 1000).toISOString()}',
      is_active=1,is_pay_as_you_go=0 WHERE emailid='${req.user[0][0].emailid}'`)

      const query = `
    INSERT INTO razorpay_subscription (id, amount,fee,tax, order_id, method, amount_refunded, refund_status, description, card_id, bank, wallet, vpa, email, contact, token_id, notes_address, rrn, upi_transaction_id, created_at, upi_vpa, entity, plan_id, customer_id, status,subscription_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
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
      ]

      await dbConnection.query(query, values);

      let content
      if (req.body.paymentDetails.period == 'monthly') {
        content = `
        <p>Your payment of ₹ ${amount} for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits has been successfully processed. Additionally, we have activated your monthly subscription for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits.</p>
        
        <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
        `
      }
      else {
        content = `
        <p>Your payment of ₹ ${amount} for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits has been successfully processed. Additionally, we have activated your Annual subscription for ${Number(req.body.paymentDetails.credits).toLocaleString()} credits.</p>
        
        <p>If you have any questions or concerns regarding this payment or your subscription, please feel free to contact us.</p>
        `
      }
      sendEmail(
        req.user[0][0].username,
        req.user[0][0].emailid,
        "Payment successfull",
        basicTemplate(req.user[0][0].username, content)
      );
      updateLeadStatus(req.user[0][0].emailid)
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
};
export default APIControllers;
