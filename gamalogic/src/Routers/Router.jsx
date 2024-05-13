import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import TopLoader from '../components/TopLoader';
import NotFound from '../pages/Notfound';

const QuickValidation = lazy(() => import('../pages/QuickValidation'));
const Body = lazy(() => import('../components/Body'));
const EmailFinder = lazy(() => import('../pages/EmailFinder'));
const ApiKey = lazy(() => import('../pages/ApiKey'));
const EmailVerification = lazy(() => import('../pages/EmailVerification'));
const FileEmailFinder = lazy(() => import('../pages/FileEmailFinder'));
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
  const [loading, setLoading] = useState(true);
  return (
    <Routes>
      <Route path="/" element={<Body />}>
        <Route index element={<Suspense fallback={<TopLoader loading={loading} />}><QuickValidation setLoading={setLoading}/></Suspense>} />
        <Route path="/email-finder" element={<Suspense fallback={<TopLoader loading={loading} />}><EmailFinder setLoading={setLoading}/></Suspense>} />
        <Route path="/api-Key" element={<Suspense fallback={<TopLoader loading={loading} />}><ApiKey setLoading={setLoading}/></Suspense>} />
        <Route path="/email-verification-bulk" element={<Suspense fallback={<TopLoader loading={loading} />}><EmailVerification setLoading={setLoading}/></Suspense>} />
        <Route path="/email-finder-bulk" element={<Suspense fallback={<TopLoader loading={loading} />}><FileEmailFinder setLoading={setLoading}/></Suspense>} />
        <Route path="/account-settings" element={<Suspense fallback={<TopLoader loading={loading} />}><AccountSettings setLoading={setLoading}/></Suspense>} />
        <Route path="/buyCredits" element={<Suspense fallback={<TopLoader loading={loading} />}><BuyCredits setLoading={setLoading}/></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<TopLoader loading={loading} />}><Support setLoading={setLoading}/></Suspense>} />
      </Route>
      <Route path="/" element={<Authentication />}>
        <Route index path="signin" element={<Suspense fallback={<TopLoader loading={loading} />}><Login setLoading={setLoading}/></Suspense>} />
        <Route path="signup" element={<Suspense fallback={<TopLoader loading={loading} />}><Signup setLoading={setLoading}/></Suspense>} />
        <Route path="forgotPassword" element={<Suspense fallback={<TopLoader loading={loading} />}><ForgotPassword setLoading={setLoading}/></Suspense>} />
        <Route path="resetPassword" element={<Suspense fallback={<TopLoader loading={loading} />}><ResetPassword setLoading={setLoading}/></Suspense>} />
        <Route path="VerifyYourEmail" element={<Suspense fallback={<TopLoader loading={loading} />}><PostSignupPage setLoading={setLoading}/></Suspense>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Router;
