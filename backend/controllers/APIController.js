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
      if (req.user?.api_key) {
        let apiKey = req.user.api_key;
        let validate = await axios.get(
          `https://gamalogic.com/emailvrf/?emailid=${req.body.email}&apikey=${apiKey}&speed_rank=0`
        );
        res.status(200).json(validate?.data?.gamalogic_emailid_vrfy[0]);
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
      let files = await dbConnection.query(
        `SELECT * FROM useractivity_batch_link WHERE userid='${req.user[0][0].rowid}' ORDER BY date_time DESC LIMIT 5 OFFSET ${(req.query.page - 1) * 5};`
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
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1 WHERE emailid='${req.user[0][0].emailid}'`)

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
      res.status(500).send(error);
      ErrorHandler("RazorpayPayment Controller", error, req);
    }
  },
  razorPayPaymentSuccess: async (req, res) => {
    try {
      const dbConnection = req.dbConnection;
      let user = await dbConnection.query(`SELECT rowid,credits from registration WHERE emailid='${req.user[0][0].emailid}'`)

      let newBalance = user[0][0].credits + req.body.credits
      await dbConnection.query(`UPDATE registration SET credits='${newBalance}',is_premium=1 WHERE emailid='${req.user[0][0].emailid}'`)

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
      res.status(200).json('Successfull')
    } catch (error) {
      console.log(error);
      ErrorHandler("RazorPayUpdateCredit Controller", error, req);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
export default APIControllers;
