import { SendMailClient } from "zeptomail";

async function zeptomailsend(email,subject,content) {
    const url =  "api.zeptomail.com/"; 
  const token =process.env.ZEPTOMAIL_TOKEN

  let client = new SendMailClient({ url, token });

  try {
    const resp = await client.sendMail({
      from: {
        address: "nayeem@gamalogic.com",
        name: "test",
      },
      to: [
        {
          email_address: {
            address: "nayeem670@gmail.com",
            name: "test1",
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
    console.log("Success:", resp);
  } catch (error) {
    console.log("Error:", error);
  }
}

export default zeptomailsend;
