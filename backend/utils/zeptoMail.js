import { SendMailClient } from "zeptomail";
import ErrorHandler from "./errorHandler.js";

async function zeptomailsend(name,email,subject,content) {
    const url =  "api.zeptomail.com/"; 
  const token =process.env.ZEPTOMAIL_TOKEN

  let client = new SendMailClient({ url, token });

  try {
    const resp = await client.sendMail({
      from: {
        address: "info@gamalogic.com",
        name: "Gamalogic",
      },
      to: [
        {
          email_address: {
            address: email,
            name: name,
          },
        },
      ],
      subject:subject,
      textbody: "hello",
      htmlbody: content,
      track_clicks: true,
      track_opens: true,
      // client_reference: "",
      // mime_headers: {
      //   "X-Zylker-User": "test-xxxx",
      // },
    });
  } catch (error) {
    console.log("Error:", error);
    let req=0
    ErrorHandler("Zepto Mail", error, req);

  }
}

export default zeptomailsend;
