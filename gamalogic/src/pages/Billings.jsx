import React, { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import { useUserState } from "../context/userContext";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { RiVipCrownFill } from "react-icons/ri";
import LoadingBar from "react-top-loading-bar";
import { Link } from "react-router-dom";

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
        // let res = {
        //   data: {
        //     isPremium: 1,
        //     isPayAsYouGo: "0",
        //     isMonthly: "1",
        //     isAnnual: "0",
        //     freeTrialExpiry: "2024-10-17T05:10:55.000Z",
        //     isActive: "0",
        //     credits: 9000,
        //     subStopTime: "2024-10-16T10:56:14.472Z",
        //     planDetails: {
        //       id: 24,
        //       userid: "31138",
        //       credits: "5000",
        //       is_monthly: "0",
        //       is_annual: "1",
        //       gross_amount: "240",
        //       subscription_id: "I-KK6FPURFLAHV",
        //       plan_id: "P-1LG25877VL011492YM3BRRBY",
        //       start_time: "2024-10-16T10:22:57Z",
        //       quantity: "1",
        //       name: "John Doe",
        //       address: "1 Main St, San Jose, CA, 95131, US",
        //       email_address: "sb-knucz30778477@personal.example.com",
        //       payer_id: "GCR7XAFX9UEW8",
        //       last_payment: "2024-10-16T10:23:26Z",
        //       next_billing_time: "2025-10-16T10:00:00Z",
        //       time_stamp: "2024-10-16T10:23:29.474Z",
        //       source: "paypal",
        //     },
        //   },
        // };
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
                {(billingDetails.isPayAsYouGo == 1&&billingDetails.isActive==0) ? (
                  <div>
                    <div className="md:flex justify-between  items-center">
                      <p>You are in a Pay-as-you-go plan</p>
                      {billingDetails.credits > 0 ? (
                        <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                          <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                            Active
                          </span>
                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                          <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                          <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                        </button>
                      ) : (
                        <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
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
                    {billingDetails.planDetails.is_monthly == 1 ? (
                      <div className="md:flex justify-between  items-center">
                        <p>You are on a Monthly Subscription</p>
                        {billingDetails.isActive == 1 ? (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                              Active
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        ) : (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
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
                      // annuall subscription.........................
                      <div className="md:flex justify-between  items-center">
                        <p>You are on an Annual Subscription</p>
                        {billingDetails.isActive == 1 ? (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
                            <span className="font-bold text-white text-sm relative z-10 group-hover:text-green-500 duration-500">
                              Active
                            </span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:-translate-x-full h-full"></span>
                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-x-full h-full"></span>

                            <span className="absolute top-0 left-0 w-full bg-green-500 duration-500 delay-300 group-hover:-translate-y-full h-full"></span>
                            <span className="absolute delay-300 top-0 left-0 w-full bg-green-500 duration-500 group-hover:translate-y-full h-full"></span>
                          </button>
                        ) : (
                          <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
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
                    )}
                    <div className="flex flex-col justify-center  md:p-4 w-full md:mt-12">
                      <h2 className="my-4 text-xl font-semibold text-center">
                        Subscription Details
                      </h2>
                      <div className={`rounded-lg shadow-lg w-full  md:p-6 `}>
                        <h2 className={` font-semibold mb-4 `}>
                          {billingDetails.planDetails.source === "paypal"
                            ? "PayPal Subscription"
                            : "Razorpay Subscription"}
                        </h2>

                        <div className="space-y-3 text-xs md:text-base">
                          <div className="flex justify-between">
                            <span className="font-medium">Amount:</span>
                            <span>
                              {billingDetails.planDetails.gross_amount
                                ? `$${billingDetails.planDetails.gross_amount}`
                                : `₹${billingDetails.planDetails.amount}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Period:</span>
                            <span>
                              {billingDetails.planDetails.is_monthly == 1
                                ? `Monthly`
                                : `Annual`}
                            </span>
                          </div>
                          {(billingDetails.planDetails.next_billing_time&&billingDetails.isActive==1) && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Next Billing Time:
                              </span>
                              <span>
                                {billingDetails.planDetails.next_billing_time
                                  ? new Date(
                                      billingDetails.planDetails.next_billing_time
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          )}
                          {billingDetails.isActive == 0 && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Subscription Stop Time:
                              </span>
                              <span>
                                {billingDetails.isActive == 0
                                  ? new Date(
                                      billingDetails.subStopTime
                                    ).toLocaleDateString()
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
                              <button class="overflow-hidden md:mt-12 w-64 p-2 h-12 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group">
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
                        ).toLocaleDateString()}
                      </p>
                      <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-red-500 text-sm rounded mt-4 md:mt-0">
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
                        ).toLocaleDateString()}
                      </p>
                      <button className="cursor-pointer relative group overflow-hidden border-2 px-5 py-2 border-green-500 text-sm rounded mt-4 md:mt-0">
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
