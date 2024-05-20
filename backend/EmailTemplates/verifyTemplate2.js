const verifyEmailTemplate2 = (name, token) => {
    // const encodedReferer = encodeURIComponent(referer);
    const htmlFile = `
    <!DOCTYPE html>
    <html>
    
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <style>
        /* CSS styles */
        body {
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
    
        .header {
            background-color: #d0d0d0;
            padding: 10px 0;
            text-align: center;
            color: rgb(255, 255, 255);
          }
    
        .content {
          padding: 20px 20px;
        }
    
        .footer {
          /* background-color: #0A0E2B; */
          /* color: rgb(255, 255, 255); */
          padding: 10px 0;
          font-size: 14px;
          text-align: center;
        }
        .footer .sprt{
          text-decoration:underline;
          font-weight:600
        }
    
        img {
          display: block;
          margin: 10px auto;
          width: 30%;
        }
    
        .icons-table {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          text-align: center;
          /* Center text content horizontally */
        }
    
        .nameofUser {
          font-size: 20px;
          font-weight:600
    
        }
    
        .verifyButton {
          background-color: #0A0E2B;
          color: #fff;
          padding: 5px 30px;
          border-radius: 10px;
          text-decoration: none;
        }
    
        .emailSub {
          font-size: 10px;
    
        }
    
        .emailSub a {
          text-decoration: underline;
        }
    
        .sicons{
            color:gray;
            margin:0 20px;
            width: 16px;
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <div class="header">
        <img src="https://stratus.campaign-image.com/images/1062965000003477148_5_1715936319088_preview.png" alt="">
        </div>
        <div class="content">
          <p class="nameofUser">Hii ${name},</p>
          <p>Welcome to Gamalogic! To start using your account, please click the link below to verify your email address:
          </p>
          <a class="verifyButton" href="https://beta.gamalogic.com/api/verifyEmail?email=${token}">verify</a>
          <p>Thank you for joining us. If you have any questions, feel free to contact our support team.</p>
          <br>
          <p>Best regards,<br>
              Team Gamalogic</p>
        </div>
        <div class="footer">
          <div class="tableDiv">
            <p>If you have any questions, feel free to contact us at <a class="sprt">support@gamalogic.com</a></p>
            <table class="icons-table">
              <tbody class="icons-tbody">
                <tr>
                  <td align="center" valign="top" class="es-p40r"><a target="_blank"
                      href="https://www.facebook.com/gamalogicapp"><img src="https://beta.gamalogic.com/fb.png" class="sicons" alt="Facebook"></a>
                  </td>
                  <td align="center" valign="top" class="es-p40r"><a target="_blank"
                      href="https://twitter.com/Gamalogicapp"><img src="https://beta.gamalogic.com/twitter(2).png" class="sicons" alt="Twitter"></a>
                  </td>
                  <td align="center" valign="top" class="es-p40r"><a target="_blank"
                      href="https://www.youtube.com/@Gamalogic"><img src="https://beta.gamalogic.com/youtube.png" class="sicons" alt="Youtube"></a>
                  </td>
                  <td align="center" valign="top" class="es-p40r"><a target="_blank"
                      href="https://www.linkedin.com/company/gamalogic"><img src="https://beta.gamalogic.com/linkedin.png" class="sicons" alt="Linkedin"></a>
                  </td>
                  <td align="center" valign="top"><a target="_blank"
                      href="mailto:support@gamalogic.com"><img src="https://beta.gamalogic.com/mail.png" class="sicons" alt="Gmail"></a>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <p class="emailSub">Would you like to change how you receive these emails?<br>
    
    Please <a>update your preferences</a> or <a>unsubscribe from this mailing list.</a></p>
          </div>
        </div>
      </div>
    </body>
    
    </html>
    `
    return htmlFile
}


export default verifyEmailTemplate2