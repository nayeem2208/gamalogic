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
import childTeamCreationInvite from "../EmailTemplates/childAccountInviteEmail.js";
import inviteTeamMemberToken from "../utils/inviteTeamMemberToken.js";



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
                updatedFields.username = `${req.body.firstname}${req.body.lastname}`;
            } else if (req.body.firstname) {
                const [, ...lastNameParts] = req.user[0][0].username.split(/(?=[A-Z])/);
                updatedFields.username = `${req.body.firstname}${lastNameParts.join('')}`;
            } else if (req.body.lastname) {
                const [firstNamePart] = req.user[0][0].username.split(/(?=[A-Z])/);
                updatedFields.username = `${firstNamePart}${req.body.lastname}`;
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
            if (req.user[0][0].is_premium == 0) {
                res.status(500).json({ message: "You should be a premium user to create team" });
                return
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
            // dashboard/team
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
            if(existingInvite[0].is_member!=null&&existingInvite[0].is_member!=0){
                return res.status(200).json({message: "Invited email is already a user" })
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
                childTeamCreationInvite(req.user[0][0].username, token, link)
            );
            res.status(200).json({ message: "Invitation link has been successfully sent" })
        } catch (error) {
            console.log(error)
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
            let invited = await dbConnection.query(`SELECT emailaddress from team_member_invite where team_id='${req.user[0][0].rowid}' AND (is_deleted IS NULL OR is_deleted = 0)`)
            res.status(200).json({ teamMembers: teamMembers[0], invited: invited[0] })
        } catch (error) {
            console.log(error)
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
            await dbConnection.query(
                `UPDATE registration SET is_team_member = 0, team_id = NULL WHERE emailid = ?`,
                [req.body.email]
            );
            res.status(200).json({ message: 'succesfully deleted' })
        } catch (error) {
            console.log(error)
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
            res.status(500).json({ error: 'Failed to delete invitation' });
        } finally {
            if (dbConnection) {
                await dbConnection.release();
            }
        }
    }
    

}
export default newControllers