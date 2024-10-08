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

  return (
    <div className="affiliate-container px-6 md:px-20 py-8 accountSettings text-center sm:text-start">
      <SubHeader SubHeader={"Affiliate"} />
      {userDetails.confirm == 1 ? (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          <h3>Sharing is caring</h3>
          <p className="my-7 description">
          Join our affiliate program and start earning from every purchase made through your referral link!
          </p>
          <a target="_blank" href={import.meta.env.VITE_THRIVE_AFFILIATE_URL} className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium" 
        //   onClick={handleAffiliateClick}
          >
            BECOME AN AFFILIATE
          </a>
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to become affiliate.
        </p>
      )}
    </div>
  );
}

export default Affiliate;
