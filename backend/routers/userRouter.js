import express from 'express'
import Authentication from '../controllers/userAuthController.js';
import APIControllers from '../controllers/APIController.js';
import authcheck from '../middlewares/auth.js';
import dbMiddleware from '../middlewares/dbMiddleware.js';
import APIDecode from '../middlewares/apiDecode.js';

const router=express.Router()

router.get('/sampleCheck',dbMiddleware,Authentication.sample)
router.post('/login',dbMiddleware,Authentication.login)
router.post('/signup',dbMiddleware,Authentication.registerUser)
router.get('/verifyEmail',dbMiddleware,Authentication.verifyEmail)
router.post('/googleSignup',dbMiddleware,Authentication.googleAuth)
router.post('/googleLogin',dbMiddleware,Authentication.googleLogin)
router.post('/forgotPassword',dbMiddleware,Authentication.forgotPassword)
router.post('/resetPassword',dbMiddleware,Authentication.resetPassword)
router.get('/SendVerifyEmail',dbMiddleware,Authentication.sendVerifyEmail)

router.get('/getCreditBalance',dbMiddleware,authcheck,APIControllers.getCreditBalance)
router.post('/singleEmailValidator',dbMiddleware,authcheck,APIControllers.emailValidation)
router.post('/singleEmailFinder',dbMiddleware,authcheck,APIControllers.FindSingleEmail)

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

router.get('/getApiKey',dbMiddleware,authcheck,APIControllers.getApi)
router.get('/resetApiKey',dbMiddleware,authcheck,APIControllers.resetApiKey)
router.post('/changePassword',dbMiddleware,authcheck,APIControllers.changePassword)
router.post('/updateCredit',dbMiddleware,authcheck,APIControllers.PayPalUpdateCredit)
router.post('/paymentFailedEmail',dbMiddleware,authcheck,APIControllers.PayPalCreditFailureEmail)
router.post('/Razorpay',dbMiddleware,authcheck,APIControllers.RazorpayPayment)
router.post('/RazorPayPaymentSuccess',dbMiddleware,authcheck,APIControllers.razorPayPaymentSuccess)


export default router;