import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import TopLoader from '../components/TopLoader';
import NotFound from '../pages/Notfound';
import BlockePage from '../pages/BlockePage';
import EmailVerifiedPage from '../components/EmailVerifiedPage';
import ServerError from '../pages/ServerError';
import { useUserState } from '../context/userContext';
import VerifyAgainErrorPage from '../components/VerifyAgainErrorPage';
import SubscriptionCancellationConfirmed from '../components/SubscriptionCancellationConfirmed';
import SubscriptionCancellationError from '../components/SubscriptionCancellationError';

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
const Affiliate=lazy(()=>import('../pages/Affiliate'))
const Billing=lazy(()=>import('../pages/Billings'))
const Team=lazy(()=>import('../pages/Team'))
const DeleteAccountSuccess=lazy(()=>import('../components/DeleteAccount/DeleteAccountSuccess'))




function Router() {
  const [loading, setLoading] = useState(true);
  let { userDetails } = useUserState();

  
  return (
    <Routes>
      <Route path="/" element={<Body />}>
      <Route index element={<Navigate to={userDetails ? "/dashboard/quick-validation" : "/signin"} />} />
        <Route  path='dashboard/quick-validation' element={<Suspense fallback={<TopLoader loading={loading} />}><QuickValidation setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/email-finder" element={<Suspense fallback={<TopLoader loading={loading} />}><EmailFinder setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/apikey" element={<Suspense fallback={<TopLoader loading={loading} />}><ApiKey setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/file-upload" element={<Suspense fallback={<TopLoader loading={loading} />}><EmailVerification setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/file-upload-finder" element={<Suspense fallback={<TopLoader loading={loading} />}><FileEmailFinder setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/account-settings" element={<Suspense fallback={<TopLoader loading={loading} />}><AccountSettings setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/buy-credits" element={<Suspense fallback={<TopLoader loading={loading} />}><BuyCredits setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/support" element={<Suspense fallback={<TopLoader loading={loading} />}><Support setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/affiliate" element={<Suspense fallback={<TopLoader loading={loading} />}><Affiliate setLoading={setLoading}/></Suspense>} />
        <Route path="dashboard/billing" element={<Suspense fallback={<TopLoader loading={loading} />}><Billing setLoading={setLoading}/></Suspense>} />
        <Route path='dashboard/team' element={<Suspense fallback={<TopLoader loading={loading}/>}><Team setLoading={setLoading}/></Suspense>}/>

      </Route>
      <Route path="/" element={<Authentication />}>
        <Route index path="signin" element={<Suspense fallback={<TopLoader loading={loading} />}><Login setLoading={setLoading}/></Suspense>} />
        <Route path="signup" element={<Suspense fallback={<TopLoader loading={loading} />}><Signup setLoading={setLoading}/></Suspense>} />
        <Route path="resetPassword" element={<Suspense fallback={<TopLoader loading={loading} />}><ForgotPassword setLoading={setLoading}/></Suspense>} />
        <Route path="reset" element={<Suspense fallback={<TopLoader loading={loading} />}><ResetPassword setLoading={setLoading}/></Suspense>} />
        <Route path="VerifyYourEmail" element={<Suspense fallback={<TopLoader loading={loading} />}><PostSignupPage setLoading={setLoading}/></Suspense>} />
      </Route>
      <Route path="/cancelSubscriptionConfirmation" element={<SubscriptionCancellationConfirmed />} />
      <Route path="/cancelSubscriptionError" element={<SubscriptionCancellationError />} />
      <Route path="*" element={<NotFound />} />
      <Route path='/blocked' element={<BlockePage/>}/>
      <Route path='/EmailConfirmed' element={<EmailVerifiedPage/>}/>
      <Route path='/EmailAlreadyverified' element={<VerifyAgainErrorPage/>}/>
      <Route path='/DeleteAccountSuccess' element={<Suspense fallback={<TopLoader loading={loading}/>}><DeleteAccountSuccess setLoading={setLoading}/></Suspense>}/>
    </Routes>
  );
}

export default Router;
