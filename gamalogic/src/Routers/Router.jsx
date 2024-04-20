import React from 'react'
import { Route, Routes } from 'react-router-dom'
import QuickValidation from '../pages/QuickValidation'
import Body from '../components/Body'
import EmailFinder from '../pages/EmailFinder'
import ApiKey from '../pages/ApiKey'
import EmailVerification from '../pages/EmailVerification'
import FileEmailFinder from '../pages/FileEmailFinder'
import ApiDocs from '../pages/ApiDocs'
import FindAnyEmail from '../pages/FindAnyEmail'
import IntegrateGoogleSheet from '../pages/IntegrateGoogleSheet'
import AccountSettings from '../pages/AccountSettings'
import BuyCredits from '../pages/BuyCredits'
import Support from '../pages/Support'
import Authentication from '../pages/Authentication'
import Login from '../components/Login'
import Signup from '../components/Signup'
import ForgotPassword from '../components/ForgotPassword'
import ResetPassword from '../components/ResetPassword'
import PostSignupPage from '../components/PostSignupPage'


function Router() {
  return (
    <Routes>
        <Route path='/' element={<Body/>}>
            <Route index element={<QuickValidation/>} />
            <Route path='/email-finder' element={<EmailFinder />} />
            <Route path='/api-Key' element={<ApiKey />} />
            <Route path='/email-verification-bulk' element={<EmailVerification/>} />
            <Route path='/email-finder-bulk' element={<FileEmailFinder/>} />
            <Route path='/api-docs' element={<ApiDocs/>} />
            <Route path='/find-any-email' element={<FindAnyEmail/>} />
            <Route path='/googleSheet-integration' element={<IntegrateGoogleSheet/>} />
            <Route path='/account-settings' element={<AccountSettings/>} />
            <Route path='/buyCredits' element={<BuyCredits/>} />
            <Route path='/support' element={<Support/>} />
        </Route>
        <Route path='/' element={<Authentication/>}>
            <Route index path='signin' element={<Login/>}/>
            <Route path='signup' element={<Signup/>}/>
            <Route path='forgotPassword' element={<ForgotPassword/>}/>
            <Route path='resetPassword' element={<ResetPassword/>}/>
            <Route path='VerifyYourEmail' element={<PostSignupPage/>}/>
        </Route>
    </Routes>
  )
}

export default Router
