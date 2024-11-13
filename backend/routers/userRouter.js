import express from 'express'
import Authentication from '../controllers/userAuthController.js';
import APIControllers from '../controllers/APIController.js';
import authcheck from '../middlewares/auth.js';
import dbMiddleware from '../middlewares/dbMiddleware.js';
import APIDecode from '../middlewares/apiDecode.js';
import newControllers from '../controllers/newController.js';

const router=express.Router()

router.get('/sampleCheck',dbMiddleware,Authentication.sample)
router.post('/sampleCheck1',Authentication.samplePost)
router.post('/login',dbMiddleware,Authentication.login)
router.post('/signup',dbMiddleware,Authentication.registerUser)
router.get('/verifyEmail',dbMiddleware,Authentication.verifyEmail)
router.post('/googleSignup',dbMiddleware,Authentication.googleAuth)
router.post('/googleLogin',dbMiddleware,Authentication.googleLogin)
router.post('/linkedinSignUp',dbMiddleware,Authentication.linkedinSignUp)
router.post('/linkedinSignIn',dbMiddleware,Authentication.linkedinSignIn)
router.post('/microsoftSignUP',dbMiddleware,Authentication.microsoftSignUP)
router.post('/microsoftLogin',dbMiddleware,Authentication.microsoftLogin)
router.get('/.well-known/microsoft-identity-association.json',Authentication.microsoftDomainVerification)
router.post('/forgotPassword',dbMiddleware,Authentication.forgotPassword)
router.post('/resetPassword',dbMiddleware,Authentication.resetPassword)
router.get('/SendVerifyEmail',dbMiddleware,Authentication.sendVerifyEmail)

router.get('/getCreditBalance',dbMiddleware,APIControllers.getCreditBalance)
router.post('/singleEmailValidator',APIDecode,APIControllers.emailValidation)
router.post('/singleEmailFinder',APIDecode,APIControllers.FindSingleEmail)

//file based email validation
router.get('/getAllUploadedEmailValidationFiles',dbMiddleware,authcheck,APIControllers.getAlreadyCheckedBatchEmailFiles)
router.post('/batchEmailVerification',dbMiddleware,authcheck,APIControllers.batchEmailValidation)
router.get('/getBatchStatus',APIDecode,APIControllers.batchEmailStatus)
router.get('/downloadEmailVerificationFile',dbMiddleware,authcheck,APIControllers.downloadEmailVerificationFile)

//file based email finder 
router.get('/getAllUploadedEmailFinderFiles',dbMiddleware,authcheck,APIControllers.getAlreadyCheckedBatchEmailFinderFiles)
router.post('/batchEmailFinder',dbMiddleware,authcheck,APIControllers.batchEmailFinder)
router.get('/getBatchFinderStatus',APIDecode,APIControllers.batchEmailFinderStatus)
router.get('/downloadEmailFinderFile',dbMiddleware,authcheck,APIControllers.downloadEmailFinderResultFile)

router.get('/getApiKey',APIDecode,APIControllers.getApi)
router.get('/resetApiKey',dbMiddleware,authcheck,APIControllers.resetApiKey)
router.post('/changePassword',dbMiddleware,authcheck,APIControllers.changePassword)
router.post('/updateCredit',dbMiddleware,authcheck,APIControllers.PayPalUpdateCredit)
router.post('/paymentFailedEmail',dbMiddleware,authcheck,APIControllers.PayPalCreditFailureEmail)
router.post('/payPalSubscription',dbMiddleware,authcheck,APIControllers.payPalSubscription)
router.post('/paypalWebhook',dbMiddleware,APIControllers.payPalWebHook)
router.post('/Razorpay',dbMiddleware,authcheck,APIControllers.RazorpayPayment)
router.post('/RazorPayPaymentSuccess',dbMiddleware,authcheck,APIControllers.razorPayPaymentSuccess)
router.post('/razorPaySubscription',dbMiddleware,authcheck,APIControllers.razorPaySubscriptin)
router.post('/RazorPaySubscriptionPaymentSuccess',dbMiddleware,authcheck,APIControllers.razorPaySubscriptionSuccess)
router.post('/RazorPayWebhook',dbMiddleware,APIControllers.razorPayWebhook)

router.get('/getPlanDetails',dbMiddleware,authcheck,APIControllers.getPlanDetails)

router.get('/cancelSubscription',dbMiddleware,authcheck,newControllers.cancelSubscription)
router.get('/ConfirmSubscriptionCancellation',dbMiddleware,newControllers.verifyCancelSubscription)
router.post('/updateMoreDetails',dbMiddleware,authcheck,newControllers.addMoreDetails)
router.get('/getMoreDetails',dbMiddleware,authcheck,newControllers.getMoreDetails)
router.get('/createTeamAccount',dbMiddleware,authcheck,newControllers.createTeam)
router.get('/teamCreationVerify',dbMiddleware,newControllers.verifyTeamCreationLink)
router.post('/sendSecondaryUserInvite',dbMiddleware,authcheck,newControllers.sendInviteLinkForSecondaryUser)
router.get('/getTeamDetails',dbMiddleware,authcheck,newControllers.getTeamDetails)
router.post('/deleteFromTeam',dbMiddleware,authcheck,newControllers.removeFromTeam)
router.post('/deleteTeamMemberInvite',dbMiddleware,authcheck,newControllers.removeTeamMemberInvite)

router.get('/affiliateUserId',dbMiddleware,authcheck,APIControllers.affilateUserId)
router.post('/loyalityProgram',APIControllers.loyalityWebhook)

export default router;