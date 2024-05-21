const forgotPasswordTemplate = (name, token, link) => {
    // const encodedReferer = encodeURIComponent(referer);
    const htmlFile = `
    <!DOCTYPE html>
    <html>
    
    <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
            integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
            crossorigin="anonymous" referrerpolicy="no-referrer" />
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
                background-color: #11112b;
                font-family: 'Montserrat', sans-serif;
                padding: 10px 0;
                font-size: xx-large;
                text-align: center;
                color: rgb(255, 255, 255);
            }
    
            .header img {
                width: 18rem;
            }
    
            .content {
                padding: 20px 20px;
            }
    
            .content a {
                text-align: center;
            }
    
            .footer {
                padding: 10px 0;
                font-size: 14px;
                text-align: center;
            }
    
            .footer .sprt {
                text-decoration: underline;
                font-weight: 600;
            }
    
            img {
                display: block;
                margin: 10px auto;
                width: 30%;
            }
    
            .iconsDiv {
                width: 100%;
                text-align: center;
            }
    
            .nameofUser {
                font-size: 20px;
                font-weight: 600;
            }
    
            .verify {
                text-align: center;
                margin-top: 30px;
            }
    
            .verifyButton {
                background-color: #0A0E2B;
                color: #fff;
                padding: 10px 100px;
                border-radius: 10px;
                text-decoration: none;
                font-size: 16px;
                margin: 20px auto;
                font-weight: 600;
                border: none;
            }
    
            .emailSub {
                font-size: 10px;
            }
    
            .emailSub a {
                text-decoration: underline;
            }
    
            .sicons {
                color: gray;
                width: 16px;
                margin: 0 15px;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <img src="https://beta.gamalogic.com/gmLogo.png" alt="GAMALOGIC">
            </div>
            <div class="content">
                <p class="nameofUser">Hi ${name},</p>
                <p>We received a request to reset your password. To proceed with resetting your password, please click the link below:</p>
    
                <div class="verify">
                    <a href="https://beta.gamalogic.com/resetPassword?email=${token}"><button
                            class="verifyButton">Reset Password</button></a>
                    <p>Or</p>
                    <p>
                        <a href="https://beta.gamalogic.com/resetPassword?email=${token}">${link}</a>
                    </p>
                </div>
                <p>If you didn't request this change, you can ignore this email. Your account security is important to us.</p>
                <br>
                <p>Best regards,<br>
                    Team Gamalogic</p>
            </div>
            <div class="footer">
                <p>If you have any questions, feel free to contact us at <a class="sprt">support@gamalogic.com</a></p>
                <div class="iconsDiv">
                    <table align="center">
                        <tr>
                            <td><a target="_blank" href="https://www.facebook.com/gamalogicapp"><img
                                        src="https://beta.gamalogic.com/fb.png" class="sicons" alt="FB"></a></td>
                            <td><a target="_blank" href="https://twitter.com/Gamalogicapp"><img
                                        src="https://beta.gamalogic.com/twitter(2).png" class="sicons" alt="Twt"></a></td>
                            <td><a target="_blank" href="https://www.youtube.com/@Gamalogic"><img
                                        src="https://beta.gamalogic.com/youtube.png" class="sicons" alt="YT"></a></td>
                            <td><a target="_blank" href="https://www.linkedin.com/company/gamalogic"><img
                                        src="https://beta.gamalogic.com/linkedin.png" class="sicons" alt="LI"></a></td>
                            <td><a target="_blank" href="mailto:support@gamalogic.com"><img
                                        src="https://beta.gamalogic.com/mail.png" class="sicons" alt="GM"></a></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </body>
    
    </html>
    
    `
    return htmlFile
}


export default forgotPasswordTemplate