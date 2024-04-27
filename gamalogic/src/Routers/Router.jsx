import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const QuickValidation = lazy(() => import('../pages/QuickValidation'));
const Body = lazy(() => import('../components/Body'));
const EmailFinder = lazy(() => import('../pages/EmailFinder'));
const ApiKey = lazy(() => import('../pages/ApiKey'));
const EmailVerification = lazy(() => import('../pages/EmailVerification'));
const FileEmailFinder = lazy(() => import('../pages/FileEmailFinder'));
const ApiDocs = lazy(() => import('../pages/ApiDocs'));
const FindAnyEmail = lazy(() => import('../pages/FindAnyEmail'));
const IntegrateGoogleSheet = lazy(() => import('../pages/IntegrateGoogleSheet'));
const AccountSettings = lazy(() => import('../pages/AccountSettings'));
const BuyCredits = lazy(() => import('../pages/BuyCredits'));
const Support = lazy(() => import('../pages/Support'));
const Authentication = lazy(() => import('../pages/Authentication'));
const Login = lazy(() => import('../components/Login'));
const Signup = lazy(() => import('../components/Signup'));
const ForgotPassword = lazy(() => import('../components/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/ResetPassword'));
const PostSignupPage = lazy(() => import('../components/PostSignupPage'));

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Body />}>
        <Route index element={<Suspense fallback={<div>Loading...</div>}><QuickValidation /></Suspense>} />
        <Route path="/email-finder" element={<Suspense fallback={<div>Loading...</div>}><EmailFinder /></Suspense>} />
        <Route path="/api-Key" element={<Suspense fallback={<div>Loading...</div>}><ApiKey /></Suspense>} />
        <Route path="/email-verification-bulk" element={<Suspense fallback={<div>Loading...</div>}><EmailVerification /></Suspense>} />
        <Route path="/email-finder-bulk" element={<Suspense fallback={<div>Loading...</div>}><FileEmailFinder /></Suspense>} />
        <Route path="/api-docs" element={<Suspense fallback={<div>Loading...</div>}><ApiDocs /></Suspense>} />
        <Route path="/find-any-email" element={<Suspense fallback={<div>Loading...</div>}><FindAnyEmail /></Suspense>} />
        <Route path="/googleSheet-integration" element={<Suspense fallback={<div>Loading...</div>}><IntegrateGoogleSheet /></Suspense>} />
        <Route path="/account-settings" element={<Suspense fallback={<div>Loading...</div>}><AccountSettings /></Suspense>} />
        <Route path="/buyCredits" element={<Suspense fallback={<div>Loading...</div>}><BuyCredits /></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<div>Loading...</div>}><Support /></Suspense>} />
      </Route>
      <Route path="/" element={<Authentication />}>
        <Route index path="signin" element={<Suspense fallback={<div>Loading...</div>}><Login /></Suspense>} />
        <Route path="signup" element={<Suspense fallback={<div>Loading...</div>}><Signup /></Suspense>} />
        <Route path="forgotPassword" element={<Suspense fallback={<div>Loading...</div>}><ForgotPassword /></Suspense>} />
        <Route path="resetPassword" element={<Suspense fallback={<div>Loading...</div>}><ResetPassword /></Suspense>} />
        <Route path="VerifyYourEmail" element={<Suspense fallback={<div>Loading...</div>}><PostSignupPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default Router;
