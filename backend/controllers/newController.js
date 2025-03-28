import axios from "axios";
import urls from "../ConstFiles/urls.js";
import verifyCancelSubscriptionTemplate from "../EmailTemplates/verfiyCancelSubscriptionTemplate.js";
import subscriptionCancelConfirmationToken from "../utils/cancelSubscriptionToken.js";
import ErrorHandler from "../utils/errorHandler.js"
import sendEmail from "../utils/zeptoMail.js";
import jwt from "jsonwebtoken";
import basicTemplate from "../EmailTemplates/BasicTemplate.js";
import Razorpay from "razorpay";
import createTeamVerificationLink from "../EmailTemplates/createTeamEmail.js";
import inviteTeamMemberToken from "../utils/inviteTeamMemberToken.js";
import childTeamMemberInvite from "../EmailTemplates/childAccountInviteEmail.js";
import deleteAccountVerify from "../EmailTemplates/deleteAccountVerifyLink.js";
import { downloadSalesInvoice, listSalesOrders } from "../utils/zohoBooks.js";
import { io, activeUsers } from "../index.js";


const newControllers = {
    cancelSubscription: async (req, res) => {
        try {
            let token = subscriptionCancelConfirmationToken(req.user[0][0].emailid)
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
            ErrorHandler("cancel subscription Controller", error, req)
        }
        finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
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


            res.redirect(`${urls.frontendUrl}/dashboard/billing?success=true`);
        } catch (error) {
            console.log(error)
            if (error.name === 'TokenExpiredError') {
                console.error('Token has expired');
                res.redirect(`${urls.frontendUrl}/dashboard/billing?error=expired`);
            } else if (error.name === 'JsonWebTokenError') {
                console.error('Invalid token');
                res.redirect(`${urls.frontendUrl}/dashboard/billing?error=invalid`);
            } else {
                console.error('An error occurred:', error);
                res.redirect(`${urls.frontendUrl}/dashboard/billing?error=generic`);
            }
            ErrorHandler("verifyCancelSubscription Controller", error, req);

        }
        finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    addMoreDetails: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const updatedFields = {};

            if (req.body.firstname && req.body.lastname) {
                updatedFields.username = `${req.body.firstname} ${req.body.lastname}`;
            } else if (req.body.firstname) {
                const [, ...lastNameParts] = req.user[0][0].username.split(/(?=[A-Z])/);
                updatedFields.username = `${req.body.firstname} ${lastNameParts.join('')}`;
            } else if (req.body.lastname) {
                const [firstNamePart] = req.user[0][0].username.split(/(?=[A-Z])/);
                updatedFields.username = `${firstNamePart} ${req.body.lastname}`;
            }

            const dbUser = req.user[0][0];
            if (req.body.firstname && req.body.firstname !== dbUser.firstname) updatedFields.firstname = req.body.firstname;
            if (req.body.lastname && req.body.lastname !== dbUser.lastname) updatedFields.lastname = req.body.lastname;
            if (req.body.phone_country_code && req.body.phone_country_code !== dbUser.phone_country_code) updatedFields.phone_country_code = req.body.phone_country_code
            if (req.body.phone_number && req.body.phone_number !== dbUser.phone_number) updatedFields.phone_number = req.body.phone_number;
            if (req.body.title && req.body.title !== dbUser.title) updatedFields.title = req.body.title;
            if (req.body.company_name && req.body.company_name !== dbUser.company_name) updatedFields.company_name = req.body.company_name;
            if (req.body.address_line_1 && req.body.address_line_1 !== dbUser.address_line_1) updatedFields.address_line_1 = req.body.address_line_1;
            if (req.body.address_line_2 && req.body.address_line_2 !== dbUser.address_line_2) updatedFields.address_line_2 = req.body.address_line_2;
            if (req.body.city && req.body.city !== dbUser.city) updatedFields.city = req.body.city;
            if (req.body.pincode && req.body.pincode !== dbUser.pincode) updatedFields.pincode = req.body.pincode;
            if (req.body.country && req.body.country !== dbUser.country) updatedFields.country = req.body.country;
            if (req.body.state && req.body.state !== dbUser.state) updatedFields.state = req.body.state;
            if (req.body.tax_id && req.body.tax_id !== dbUser.tax_id) updatedFields.tax_id = req.body.tax_id;
            if (req.body.accountType === 'Company') {
                updatedFields.is_company = Buffer.from([1]);
                updatedFields.is_personal = Buffer.from([0]);
            } else if (req.body.accountType === 'Personal') {
                updatedFields.is_personal = Buffer.from([1]);
                updatedFields.is_company = Buffer.from([0]);
            }
            const updateStatements = [];
            const values = [];
            let query = `UPDATE registration SET `;

            for (const [key, value] of Object.entries(updatedFields)) {
                updateStatements.push(`${key} = ?`);
                values.push(value);
            }

            if (updateStatements.length === 0) {
                return res.status(400).json({ message: 'No fields to update.' });
            }

            query += updateStatements.join(', ') + ` WHERE rowid = ?`;
            values.push(req.user[0][0].rowid);
            await dbConnection.query(query, values);

            return res.status(200).json({ message: 'User details updated successfully.' });
        } catch (error) {
            console.error(error);
            ErrorHandler("addMoreDetails Controller", error, req);

            return res.status(500).json({ message: 'An error occurred while updating user details.' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    getMoreDetails: async (req, res) => {
        try {
            let user = req.user[0][0]
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            ErrorHandler("getMoreDetails Controller", error, req);
            res.status(500)
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    createTeam: async (req, res) => {
        try {
            const requiredFields = [
                "title",
                "phone_country_code",
                "phone_number",
                "address_line_1",
                "city",
                "pincode",
                "country",
                "state",
                "firstname",
                "lastname"
            ];

            const validateFields = (data) => {
                const missingFields = requiredFields.filter((field) => !data[field]);
                if (!data.is_company && !data.is_personal) {
                    missingFields.push("is_company or is_personal");
                }
                if (data.is_company && !data.company_name) {
                    missingFields.push("company_name");
                }
                return missingFields;
            };
            if (req.user[0][0].is_premium === 0) {
                res.status(500).json({ message: "You should be a premium user to create a team" });
                return;
            }

            const missingFields = validateFields(req.user[0][0]);
            console.log(missingFields, 'missing fields')
            if (missingFields.length > 0) {
                res.status(400).json({ message: `Please fill all the required fields to create a team` });
                return;
            }

            //using same subscriptionCancelConfirmationToken here cos it can use here too
            let token = subscriptionCancelConfirmationToken(req.user[0][0].emailid)
            let link = `${urls.frontendUrl}/api/teamCreationVerify?email=${token}`

            let sub = `Invitation to Create Your Gamalogic Team Account`;

            sendEmail(
                req.user[0][0].username,
                req.user[0][0].emailid,
                sub,
                createTeamVerificationLink(req.user[0][0].username, token, link)
            );
            res.status(200).json({ message: "Email sent successfully" });

        } catch (error) {
            console.log(error)
            ErrorHandler("create team Controller", error, req)
            res.status(500).json({ message: "Failed to create team" });

        }
        finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    verifyTeamCreationLink: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
            const userEmail = decoded.email;
            await dbConnection.query(`UPDATE registration set is_team_admin=1 where emailid='${userEmail}'`)
            const [rows] = await dbConnection.query(`SELECT username FROM registration WHERE emailid = '${userEmail}'`);
            const username = rows[0]?.username;
            let content = `<p>Congratulations! Your team has been successfully created. You can now start adding members and manage your team effectively.</p>
<p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
<div class="verify">
        <a href="${urls.frontendUrl}/dashboard/team"><button
                class="verifyButton">Go To Team Settings</button></a>

        </div>
`
            sendEmail(
                username,
                userEmail,
                "Congratulations! Your Team is Ready to Go",
                basicTemplate(username, content)
            );
            res.redirect(`${urls.frontendUrl}/dashboard/team?team=true`);
        } catch (error) {
            console.log(error)
        }
        finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    sendInviteLinkForSecondaryUser: async (req, res) => {
        try {
            let dbConnection = req.dbConnection
            const [existingInvite] = await dbConnection.query(
                `SELECT * FROM team_member_invite WHERE team_id = ? AND emailaddress = ? AND is_deleted!=1 `,
                [req.user[0][0].rowid, req.body.email]
            );
            if (existingInvite.length > 0 && existingInvite[0].is_member != null && existingInvite[0].is_member != 0) {
                return res.status(200).json({ message: "Invited email is already a user" })
            }
            if (existingInvite.length === 0) {
                const linkSent = await dbConnection.query(
                    `INSERT INTO team_member_invite (team_id, emailaddress,is_deleted) VALUES (?, ?,0)`,
                    [req.user[0][0].rowid, req.body.email]
                );
                console.log('Invitation link sent successfully');
            } else {
                console.log('Email address already invited or is already a member');
            }
            let token = inviteTeamMemberToken(req.body.email, req.user[0][0].rowid)
            let link = `${urls.frontendUrl}/signup?Team_admin=${token}`
            console.log(link, 'linkk')
            let sub = `Invitation to Join Gamalogic Team Account`;
            let nameOfUser = req.body.email.split('@')
            sendEmail(
                nameOfUser[0],
                req.body.email,
                sub,
                childTeamMemberInvite(req.user[0][0].username, token, link)
            );
            res.status(200).json({ message: "Invitation link has been successfully sent" })
        } catch (error) {
            console.log(error)
            ErrorHandler("Send invitation for members Controller", error, req)
            res.status(500).json({ error: error })
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    ResendInvite: async (req, res) => {
        try {
            console.log(req.body, 'req.body')
            let token = inviteTeamMemberToken(req.body.email, req.user[0][0].rowid)
            let link = `${urls.frontendUrl}/signup?Team_admin=${token}`
            console.log(link, 'linkk')
            let sub = `Invitation to Join Gamalogic Team Account`;
            let nameOfUser = req.body.email.split('@')
            sendEmail(
                nameOfUser[0],
                req.body.email,
                sub,
                childTeamMemberInvite(req.user[0][0].username, token, link)
            );
            res.status(200).json({ message: "Invitation link has been successfully sent" })
        } catch (error) {
            console.log(error)
            ErrorHandler("Resend invite  Controller", error, req)
            res.status(500).json({ error: error })
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    getTeamDetails: async (req, res) => {
        try {
            let dbConnection = req.dbConnection
            let teamMembers = await dbConnection.query(`SELECT emailid FROM registration where team_id='${req.user[0][0].rowid}'`)
            let invited = await dbConnection.query(`SELECT emailaddress from team_member_invite where team_id='${req.user[0][0].rowid}' AND (is_deleted IS NULL OR is_deleted = 0) AND (is_member IS NULL OR is_member=0)`)
            res.status(200).json({ teamMembers: teamMembers[0], invited: invited[0] })
        } catch (error) {
            console.log(error)
            ErrorHandler("get team details Controller", error, req)
            res.status(500).json({ error: error })
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    removeFromTeam: async (req, res) => {
        try {
            let dbConnection = req.dbConnection
            if (!req.body.email) {
                res.status(400).json({ error: 'please give the email' })
                return
            }
            let [MemberDetails] = await dbConnection.query(`SELECT username,emailid from registration where emailid='${req.body.email}'`)
            console.log(MemberDetails[0], 'member details')
            try {
                let currDate = new Date().toISOString().slice(0, 19).replace("T", " ");

                let response = await axios.post(`http://service.gamalogic.com/delete-account?api_key=${req.user[0][0].api_key}&team_member_id=${req.body.email}&is_team_admin_delete_member=1&deleted_date_time=${currDate}`);

                if (response.status === 200) {
                    console.log("Email sent successfully for account deletion.");
                    let userContent = ` <p>We wanted to inform you that you have been removed from the team. If this was unexpected, please reach out to your team admin for clarification.</p>`

                    sendEmail(
                        MemberDetails[0].username,
                        MemberDetails[0].emailid,
                        "Notification of Team Removal",
                        basicTemplate(MemberDetails[0].username, userContent)
                    );
                    let adminContent = ` <p>You have successfully removed a team member from your team. If this action was unintentional, please contact support for assistance.</p>`
                    sendEmail(
                        req.user[0][0].username,
                        req.user[0][0].emailid,
                        "Team Member Removal Confirmation",
                        basicTemplate(req.user[0][0].username, adminContent)
                    );
                    const query = `UPDATE team_member_invite SET is_deleted = 1,is_member=0 WHERE emailaddress = ? AND is_member=1`;
                    await dbConnection.query(query, [MemberDetails[0].emailid]);

                } else {
                    console.error("Failed to send delete request. Response:", response.data);
                }
                res.status(200).json({ message: 'succesfully deleted' })
            } catch (error) {
                console.error("Error occurred during account deletion:", error);
                res.status(400).json({ message: 'Error occurred during account deletion' })
            }
        } catch (error) {
            console.log(error)
            ErrorHandler("remove from team Controller", error, req)
            res.status(500).json({ error: error })
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    removeTeamMemberInvite: async (req, res) => {
        let dbConnection;
        try {
            const { email } = req.body;
            console.log(email, 'req.body email');

            dbConnection = req.dbConnection;

            const query = `UPDATE team_member_invite SET is_deleted = 1 WHERE emailaddress = ?`;
            await dbConnection.query(query, [email]);

            res.status(200).json({ message: 'Successfully deleted' });
        } catch (error) {
            console.error('Error in removeTeamMemberInvite:', error);
            ErrorHandler("Remove team member invite Controller", error, req)
            res.status(500).json({ error: 'Failed to delete invitation' });
        } finally {
            if (dbConnection) {
                await dbConnection.release();
            }
        }
    },
    deleteAccount: async (req, res) => {
        try {
            if (req.user[0][0].is_premium == 1 && (req.user[0][0].is_monthly == 1 || req.user[0][0].is_annual == 1) && req.user[0][0].is_active == 1) {

                return res.status(200).json({
                    error: "You must cancel your subscription before deleting your account."
                });
            }
            let token = subscriptionCancelConfirmationToken(req.user[0][0].emailid)
            let link = `${urls.frontendUrl}/api/verifyAccountDeletion?email=${token}`

            let sub = `Confirm Your Account Deletion`;

            sendEmail(
                req.user[0][0].username,
                req.user[0][0].emailid,
                sub,
                deleteAccountVerify(req.user[0][0].username, token, link)
            );
            res.status(200).json({ message: "Email sent successfully" });
        } catch (error) {
            console.log(error)
            ErrorHandler("Delete account Controller", error, req)
            res.status(500).json({ error: 'Failed to delete account' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    verifyAccountDelete: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            // const decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
            let decoded;
            try {
                decoded = jwt.verify(req.query.email, process.env.JWT_SECRET);
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    console.error("JWT token has expired:", err.message);
                    return res.redirect(`${urls.frontendUrl}/LinkExpired`);
                }
                console.error("JWT verification failed:", err.message);
                return res.status(400).json({ message: "Invalid token." });
            }
            const userEmail = decoded.email;
            console.log(userEmail, 'user Email')
            let [user] = await dbConnection.query('SELECT username,api_key FROM registration WHERE emailid = ?', [userEmail])
            if (!user || user.length === 0) {
                console.warn("No user found with the provided email:", userEmail);
                return res.redirect(`${urls.frontendUrl}/DeleteAccountSuccess`);
            }
            // if (user[0].is_premium == 1 && (user[0].is_monthly == 1 || user[0].is_annual == 1)) {
            //     console.log('inside premium in deletion')
            //     const [paypalSub] = await dbConnection.query(`
            //         SELECT * FROM paypal_subscription 
            //         WHERE userid='${user[0].rowid}' 
            //         ORDER BY id DESC
            //     `);

            //     const [razorPaySub] = await dbConnection.query(`
            //         SELECT * FROM razorpay_subscription 
            //         WHERE customer_id='${user[0].rowid}' 
            //         ORDER BY glid DESC
            //     `);
            //     // console.log(paypalSub,razorPaySub,'razorpay and paypal')
            //     if (paypalSub.length > 0) {
            //         console.log('inside the paypal subbbbs')
            //         const clientId = process.env.PAYPAL_CLIENTID;
            //         const clientSecret = process.env.PAYPAL_CLIENTSECRET;
            //         const paypalAuthUrl = `${urls.paypalUrl}/v1/oauth2/token`;

            //         const tokenData = new URLSearchParams({ grant_type: 'client_credentials' });
            //         const paypalHeaders = {
            //             'Content-Type': 'application/x-www-form-urlencoded',
            //             'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            //         };

            //         try {
            //             const payPalTokenResponse = await axios.post(paypalAuthUrl, tokenData, { headers: paypalHeaders });
            //             const payPalToken = payPalTokenResponse.data.access_token;

            //             for (const subscription of paypalSub) {
            //                 console.log(subscription, 'paypal subscription')
            //                 try {
            //                     await axios.post(
            //                         `${urls.paypalUrl}/v1/billing/subscriptions/${subscription.subscription_id}/cancel`,
            //                         { reason: 'Account deletion' },
            //                         {
            //                             headers: {
            //                                 'Authorization': `Bearer ${payPalToken}`,
            //                             },
            //                         }
            //                     );
            //                     console.log(`PayPal subscription ${subscription.subscription_id} canceled successfully.`);
            //                 } catch (err) {
            //                     console.error(`Failed to cancel PayPal subscription ${subscription.subscription_id}:`, err.message);
            //                 }
            //             }
            //         } catch (err) {
            //             console.error("Failed to authenticate with PayPal:", err.message);
            //         }
            //     }

            //     if (razorPaySub.length > 0) {
            //         const razorpayInstance = new Razorpay({
            //             key_id: process.env.RAZORPAY_KEY_ID,
            //             key_secret: process.env.RAZORPAY_SECRET,
            //         });

            //         for (const subscription of razorPaySub) {
            //             console.log(subscription, 'razorapy subscription')
            //             try {
            //                 await razorpayInstance.subscriptions.cancel(subscription.subscription_id);
            //                 console.log(`Razorpay subscription ${subscription.subscription_id} canceled successfully.`);
            //             } catch (err) {
            //                 console.error(`Failed to cancel Razorpay subscription ${subscription.subscription_id}:`, err.message);
            //             }
            //         }
            //     }
            // }
            let currDate = new Date().toISOString().slice(0, 19).replace("T", " ");
            let apiKey
            if (user[0].team_id && user[0].team_id !== 'null' && user[0].team_id !== null) {
                let [admin] = await dbConnection.query(`SELECT api_key FROM registration WHERE rowid = ${user[0].team_id}`);
                apiKey = admin[0].api_key;
            } else {
                apiKey = user[0].api_key;
            }
            let response = await axios.post(`http://service.gamalogic.com/delete-account?api_key=${apiKey}&deleted_date_time=${currDate}`)
            if (response.status === 200) {
                let userContent = `<p>Your account has been successfully deleted. If you did not intend to perform this action or have any concerns, please contact our support team for assistance.</p>`;

                sendEmail(
                    user[0].username,
                    userEmail,
                    "Account Deletion Confirmation",
                    basicTemplate(user[0].username, userContent)
                );
                // res.status(200).json({ message: 'Account successfully deleted' });
                res.redirect(`${urls.frontendUrl}/DeleteAccountSuccess`);
            } else {
                console.error("Failed to delete account. Response:", response.data);
                res.status(400).json({ message: 'Failed to delete account' });
            }

        } catch (error) {
            console.log(error)
            ErrorHandler("verify Account Delete Controller", error, req)
            res.status(500).json({ error: error })
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    updateTimeZone: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const { timezone } = req.body;
            const emailid = req.user[0][0].emailid;

            const query = `UPDATE registration SET time_zone = ? WHERE emailid = ?`;
            await dbConnection.query(query, [timezone, emailid]);

            res.status(200).json({ message: 'Time zone successfully updated' });
        } catch (error) {
            console.error('Error in updateTimeZone:', error);
            ErrorHandler("update timeZone Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    updateAppTourStatus: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const query = `UPDATE registration SET app_tour = ? WHERE emailid = ?`;
            await dbConnection.query(query, [1, req.user[0][0].emailid]);
            res.status(200).json({ message: 'AppTour status successfully updated' });
        } catch (error) {
            console.error('Error in AppTour updation:', error);
            ErrorHandler("update AppTour Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    downloadInvoice: async (req, res) => {
        try {
            const fileId = req.params.id;
            const pdfData = await downloadSalesInvoice(fileId);
            res.status(200).json({ invoiceHTML: pdfData });
        } catch (error) {
            console.error('Error in download Invoice:', error);
            ErrorHandler("download Invoice Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    listInvoices: async (req, res) => {
        try {
            let id = req.user[0][0].id_zoho_books
            let salesOrders = await listSalesOrders(id)
            res.status(200).json(salesOrders)
        } catch (error) {
            console.error('Error in list Invoice:', error);
            ErrorHandler("list Invoice Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    getAllNotifications: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const userId = req.user[0][0].rowid; // Assuming user ID is stored in req.user
            const query = `SELECT * FROM notification WHERE userid = ? order by id desc`;
            const [notifications] = await dbConnection.query(query, [userId]);

            // console.log(notifications, 'notificationsssssssss');

            res.status(200).json({ notifications: notifications || [] });
        } catch (error) {
            console.error('Error in fetch notifications:', error);
            ErrorHandler("getAllNotifications Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    notificationIsRead: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const { id } = req.query;
            // console.log(id,'idddddddddddddddddd')
            if (!id) {
                return res.status(400).json({ error: "Notification ID is required" });
            }

            const query = `
            UPDATE notification
            SET isRead = 1
            WHERE id = ?
        `;

            // Execute the query
            const [result] = await dbConnection.execute(query, [id]);

            // Check if the update was successful
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Notification not found" });
            }

            // Send success response
            res.status(200).json({ message: "Notification marked as read" });
        } catch (error) {
            console.error('Error in notificationIsRead:', error);
            ErrorHandler("notificationIsRead Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    },
    FileUploadCompletionNotification: async (req, res) => {
        try {
            const dbConnection = req.dbConnection;
            const { batchid: batchId, application } = req.query;
            const io = req.app.get('socketio'); // Socket.IO instance

            // 1. Validate input
            if (!batchId || !application) {
                return res.status(400).json({ error: "batchid and application are required" });
            }

            // 2. Fetch file details
            const table = application === 'validation' ? 'save_upload_file' : 'save_file_upload';
            const [file] = await dbConnection.query(
                `SELECT userid, ${table} as filename FROM useractivity_batch_${application === 'validation' ? 'link' : 'finder_link'} WHERE id = ?`,
                [batchId]
            );

            if (!file || file.length === 0) {
                return res.status(404).json({ error: "Batch not found" });
            }

            const currentTime = new Date().toISOString();
            const notificationType = application === 'validation' ? 'validation' : 'finder';
            const fileName = file[0].filename || 'Unknown file';

            // 3. Insert notification into DB
            const [result] = await dbConnection.query(
                `INSERT INTO notification (userid, header, content, time, isRead, type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    file[0].userid,
                    `Batch Email ${notificationType} completed`,
                    `Email ${notificationType} has completed for ${fileName}.`,
                    currentTime,
                    0,
                    notificationType
                ]
            );
            const socketIds = activeUsers.get(file[0].userid);
            // console.log(socketId, 'userrrrrrrrrrrrrrrrr')

            if (socketIds) {
                console.log('inside progeresss')
                if (socketIds && socketIds.length > 0) {
                    console.log('inside progress');
                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("progress", {
                            header: `Batch Email ${notificationType} completed`,
                            content: `Email ${notificationType} has completed for ${fileName}.`,
                            time: currentTime
                        });
                    });
                }
            }
            res.json({
                success: true,
                notificationId: result.insertId,
                message: "Notification sent successfully"
            });
        } catch (error) {
            console.error('Error in FileUploadCompletionNotification:', error);
            ErrorHandler("FileUploadCompletionNotification Controller", error, req);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        } finally {
            if (req.dbConnection) {
                await req.dbConnection.release();
            }
        }
    }


}
export default newControllers