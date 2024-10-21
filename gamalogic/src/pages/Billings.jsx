import React, { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import { useUserState } from "../context/userContext";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { RiVipCrownFill } from "react-icons/ri";
import LoadingBar from "react-top-loading-bar";
import { Link } from "react-router-dom";
import { SlInfo } from "react-icons/sl";
import { CalendarDate } from "calendar-date";
import GridLoader from "react-spinners/GridLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};



function Billings() {
  let { setUserDetails, userDetails } = useUserState();
  let [freeTrialExpired, setFreeTrialExpired] = useState(false);
  let [billingDetails, setBillingDetails] = useState(null);
  let [load, setLoad] = useState(30);
  let [loading, setLoading] = useState(false);
  // let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#1da6b8");




  // console.log(billingDetails, "billing detailssss");

  useEffect(() => {
    async function getPlan() {
      try {
        setLoading(true);
        let res = await axiosInstance.get("/getPlanDetails");
        setLoad(100);
        const freeTrialExpiryDate = new Date(res.data.freeTrialExpiry);
        const currentDate = new Date();

        if (currentDate > freeTrialExpiryDate) {
          setFreeTrialExpired(true);
        }
        if (res.data?.planDetails?.source === "razorpay") {
          let dateOfPay = res.data?.planDetails?.time_stamp?.split("T")[0]||res.data?.planDetails?.timestamp?.split("T")[0]
          let nextBillingDate;
  
          if (res.data?.planDetails?.is_monthly === "1") {
            nextBillingDate = new CalendarDate(dateOfPay).addMonths(1);
          } else {
            nextBillingDate = new CalendarDate(dateOfPay).addMonths(12);
          }
  
          const formattedNextBillingDate = new Date(
            nextBillingDate.unixTimestampInSeconds * 1000
          ).toISOString();
  
          res.data.planDetails.next_billing_time = formattedNextBillingDate; 
        }
        setBillingDetails(res.data);

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
      {userDetails.confirm == 1 ? (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          
          {billingDetails ? (
            billingDetails.isPremium == 1 ? (
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
                {billingDetails.isPayAsYouGo == 1 &&
                billingDetails.isActive != 1 ? (
                  <div>
                    <div className="md:flex justify-between  items-center">
                      <p>You are in a Pay-as-you-go plan</p>
                      {billingDetails.credits > 0 ? (
                        <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                          <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                            Active
                          </span>
                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                          <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                        </button>
                      ) : (
                        <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
                          <span className="font-bold text-white text-sm relative z-10 group-hover:text-red-500 duration-500">
                            Expired
                          </span>
                          <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:-translate-x-full h-full"></span>
                          <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-x-full h-full"></span>

                          <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                          <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-y-full h-full"></span>
                        </button>
                      )}
                    </div>
                    {billingDetails.credits <= 0 && (
                      <Link to="/dashboard/buy-credits">
                        <button class="overflow-hidden md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
                          PURCHASE CREDITS
                          <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                          <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                          <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                          <span class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute  left-6 z-10">
                            BECOME PREMIUM USER
                          </span>
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div>
                    {billingDetails.planDetails?.is_monthly == 1 ? (
                      <div className="md:flex justify-between  items-center">
                        <p>You are on a Monthly Subscription</p>
                        {billingDetails.isActive == 1 ? (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                              Active
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        ) : (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-red-500 duration-500">
                              Expired
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        )}
                      </div>
                    ) : billingDetails.planDetails?.is_annual == 1 ? (
                      // annuall subscription.........................
                      <div className="md:flex justify-between  items-center">
                        <p>You are on an Annual Subscription</p>
                        {billingDetails.isActive == 1 ? (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                              Active
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        ) : (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-red-500 duration-500">
                              Expired
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="flex flex-col justify-center  md:p-4 w-full md:mt-12">
                      <h2 className="my-4 text-xl font-semibold text-center">
                        Subscription Details
                      </h2>
                      <div className={`rounded-lg shadow-lg w-full  md:p-6 `}>
                        <h2 className={` font-semibold mb-4 `}>
                          {billingDetails.planDetails?.source === "paypal"
                            ? "PayPal Subscription"
                            : "Razorpay Subscription"}
                        </h2>

                        <div className="space-y-3 text-xs md:text-base">
                          <div className="flex justify-between">
                            <span className="font-medium">Amount:</span>
                            <span>
                              {billingDetails.planDetails?.gross_amount
                                ? `$${billingDetails.planDetails?.gross_amount}`
                                : `₹${billingDetails.planDetails?.amount}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Credits:</span>
                            <span>{billingDetails.planDetails?.credits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Period:</span>
                            <span>
                              {billingDetails.planDetails?.is_monthly == 1
                                ? `Monthly`
                                : `Annual`}
                            </span>
                          </div>
                          {billingDetails.planDetails?.next_billing_time &&
                            billingDetails.isActive == 1 && (
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Next Billing Time:
                                </span>
                                <span>
                                  {billingDetails.planDetails?.next_billing_time
                                    ? new Date(
                                        billingDetails.planDetails?.next_billing_time
                                      ).toLocaleDateString("en-GB")
                                    : "N/A"}
                                </span>
                              </div>
                            )}
                          {billingDetails.isActive == 0 && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Subscription Stopped Time:
                              </span>
                              <span>
                                {billingDetails.isActive == 0
                                  ? new Date(
                                      billingDetails.subStopTime
                                    ).toLocaleDateString("en-GB")
                                  : "Active"}
                              </span>
                            </div>
                          )}
                        </div>

                        {billingDetails.isActive == 0 && (
                          <div>
                            <div className="mt-4 p-2 bg-red-100 text-red-600 text-xs md:text-base rounded-lg text-center">
                              This subscription has been stopped.
                            </div>
                            <Link to="/dashboard/buy-credits">
                              <button class="overflow-hidden my-6 md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
                                PURCHASE CREDITS
                                <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                                <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                                <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                                <span class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute  left-6 z-10">
                                  ACTIVE YOUR ACCOUNT
                                </span>
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              //...........freeee trial....................
              <div className="text-gray-700 p-6 bg-white rounded-lg shadow-md">
                <p className="text-xl my-3 font-semibold">
                  You are in a free trial.
                </p>
                {freeTrialExpired ? (
                  <div>
                    <div className="md:flex justify-between  items-center">
                      <p className="text-red-500 font-semibold">
                        Your free trial credits have expired on{" "}
                        {new Date(
                          billingDetails.freeTrialExpiry
                        ).toLocaleDateString("en-GB")}
                      </p>
                      <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
                        <span className="font-bold text-white text-sm relative z-10 group-hover:text-red-500 duration-500">
                          Expired
                        </span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:-translate-x-full h-full"></span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-x-full h-full"></span>

                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                        <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-y-full h-full"></span>
                      </button>
                    </div>
                    <Link to="/dashboard/buy-credits">
                      <button class="overflow-hidden md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
                        PURCHASE CREDITS
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                        <span class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute  left-6 z-10">
                          BECOME PREMIUM USER
                        </span>
                      </button>
                    </Link>
                  </div>
                ) : billingDetails.freeCredits <= 0 ? (
                  <div>
                    <div className="md:flex justify-between  items-center">
                      <p className="text-red-500 font-semibold">
                      You have used all your free credits!
                      </p>
                      <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
                        <span className="font-bold text-white text-sm relative z-10 group-hover:text-red-500 duration-500">
                          Expired
                        </span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:-translate-x-full h-full"></span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-x-full h-full"></span>

                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                        <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 group-hover:translate-y-full h-full"></span>
                      </button>
                    </div>
                    <Link to="/dashboard/buy-credits">
                      <button class="overflow-hidden md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
                        PURCHASE CREDITS
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                        <span class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute  left-6 z-10">
                          BECOME PREMIUM USER
                        </span>
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="md:flex justify-between  items-center">
                      <p>
                        Your free trial credits will expire on{" "}
                        {new Date(
                          billingDetails.freeTrialExpiry
                        ).toLocaleDateString("en-GB")}
                      </p>
                      <button className="cursor-pointer relative group overflow-hidden border-2 px-0 w-32 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                        <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                          Active
                        </span>
                        <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                        <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                        <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                        <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                      </button>
                    </div>
                    <Link to="/dashboard/buy-credits">
                      <button class="overflow-hidden md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
                        PURCHASE CREDITS
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                        <span class="absolute w-64 h-32 -top-8  -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                        <span class="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute  left-6 z-10">
                          BECOME PREMIUM USER
                        </span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className=" h-96 flex items-center">
            <GridLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          </div>
          )}
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to view billing.
        </p>
      )}
    </div>
  );
}

export default Billings;
