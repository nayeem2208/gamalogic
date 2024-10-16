import React, { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import { useUserState } from "../context/userContext";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { RiVipCrownFill } from "react-icons/ri";
import LoadingBar from "react-top-loading-bar";

function Billings() {
  let { setUserDetails, userDetails } = useUserState();
  let [freeTrialExpired, setFreeTrialExpired] = useState(false);
  let [billingDetails, setBillingDetails] = useState(null);
  let [load, setLoad] = useState(30);
  let [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getPlan() {
      try {
        setLoading(true);
        let res = await axiosInstance.get("/getPlanDetails");
        setLoad(100);

        console.log(res.data, "ressssss");
        setBillingDetails(res.data);

        const freeTrialExpiryDate = new Date(res.data.freeTrialExpiry);
        const currentDate = new Date();

        if (currentDate > freeTrialExpiryDate) {
          setFreeTrialExpired(true);
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      }
    }
    getPlan();
  }, []);

  useEffect(() => {
    if (APP === "beta") {
      document.title = "Billing | Beta Dashboard";
    } else {
      document.title = "Billing | Dashboard";
    }
  }, []);

  return (
    <div className="Billing-container px-6 md:px-20 py-8 accountSettings text-center sm:text-start">
      <SubHeader SubHeader={"Billing"} />
      {userDetails.confirm === 1 ? (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          {billingDetails ? (
            billingDetails.isPremium === 1 ? (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="font-semibold mb-2 flex items-center">
                  You are a Premium user
                  <RiVipCrownFill className="text-yellow-400 mx-2 w-6 h-6" />
                </h2>
                {loading && (
                  <LoadingBar
                    color="#f74c41"
                    progress={load}
                    onLoaderFinished={() => {}}
                  />
                )}
                {billingDetails.isPayAsYouGo == 1 ? (
                  <div>
                    <p>You are in a Pay-as-you-go plan</p>
                  </div>
                ) : (
                  <div>
                    {billingDetails.isMonthly === 1 ? (
                      <div>
                        <p>You are on a Monthly Subscription</p>
                      </div>
                    ) : (
                      <div>
                        <p>You are on an Annual Subscription</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Example billing details */}
                {/* <h3 className="text-lg font-semibold mt-4">Billing Details</h3>
                <p className="text-sm my-3">
                  Amount:{" "}
                  <span className="font-semibold">
                    ${billingDetails.amount}
                  </span>
                </p>
                <p className="text-sm my-3">
                  Next Billing Date:{" "}
                  <span className="font-semibold">
                    {new Date(
                      billingDetails.nextBillingDate
                    ).toLocaleDateString()}
                  </span>
                </p> */}
              </div>
            ) : (
              <div className="text-gray-700">
                <p className="text-xl my-3 font-semibold">
                  You are in a free trial.
                </p>
                {freeTrialExpired ? (
                  <p className="text-red-500 font-semibold">
                    Your free trial credits have expired.
                  </p>
                ) : (
                  <p>
                    Your free trial credits will expire on{" "}
                    {new Date(
                      billingDetails.freeTrialExpiry
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          ) : (
            <p>Loading billing details...</p>
          )}
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to view account settings.
        </p>
      )}
    </div>
  );
}

export default Billings;
