import React, { useEffect } from "react";
import axiosInstance, { APP } from "../axios/axiosInstance";
import SubHeader from "../components/SubHeader";
import { useUserState } from "../context/userContext";

function Affiliate() {
  let { setUserDetails, userDetails } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Affiliate | Beta Dashboard";
    } else {
      document.title = "Affiliate | Dashboard";
    }
  }, []);
  console.log(userDetails,'userDetails')
  const handleAffiliateClick = async() => {

    let user=await axiosInstance.get('/affiliateUserId')
    console.log(user.data.user,'user is here')
    // Set the data to be sent to Zoho Thrive
    window.ztUserData = {
      za_email_id: userDetails.email, 
      user_unique_id: user.data.user.userId, 
      thrive_digest: user.data.HMACDigest, // Server generated HMAC
      signUpPage: 'https://beta.gamalogic.com/signup', // Sign-up URL
      signInPage: 'https://beta.gamalogic.com/signin', // Login URL
    };

    // Optionally delay the widget load (0-40 seconds)
    window.ztWidgetDelay = 3 || 0;

  };
  return (
    <div className="affiliate-container px-6 md:px-20 py-8 accountSettings text-center sm:text-start">
      <SubHeader SubHeader={"Affiliate"} />
      {userDetails.confirm == 1 ? (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          <h3>Sharing is caring</h3>
          <p className="my-7 description">
          Join our affiliate program and start earning from every purchase made through your referral link!
          </p>
          <a target="_blank" href="https://gamalogicorrg.zohothrive.com/thrive/publicpages/affiliate-registration/gamalogicorrg/ed466b862665a168670e0dba804fa1a672c37a4ddeb5b4ba957fb2f72c0e836b" className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium" 
        //   onClick={handleAffiliateClick}
          >
            BECOME AN AFFILIATE
          </a>
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to view account settings.
        </p>
      )}
    </div>
  );
}

export default Affiliate;