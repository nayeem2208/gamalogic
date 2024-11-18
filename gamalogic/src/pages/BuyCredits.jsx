import { Link } from "react-router-dom";
import SubHeader from "../components/SubHeader";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useRef, useState } from "react";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";
import PaymentSuccess from "../components/Payment_related/PaymentSuccess";
import PaymentFailure from "../components/Payment_related/PaymentFailure";
import ServerError from "./ServerError";
import BuyCreditsRazorPay from "./BuyCreditsRazorPay";
import Pricing from "../components/Payment_related/Pricing";
import PayPalSubscription from "../components/Payment_related/PayPalSubscription";
import BuyCreditsRazorPaySubsciption from "../components/Payment_related/RazorPaySubscription";
import AccountDetailsModal from "../components/AccountDetailsModa";

function PayPalButton({ createOrder, onApprove, onError }) {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}

export default function BuyCredits() {
  const [orderID, setOrderID] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  let [serverError, setServerError] = useState(false);

  let {
    setCreditBal,
    creditBal,
    setUserDetails,
    userDetails,
    paymentResult,
    setPaymentResult,
    paymentDetails,
    accountDetailsModal,
    setAccountDetailsModal
  } = useUserState();
  const costRef = useRef(paymentDetails.cost);
  const creditsRef = useRef(paymentDetails.credits);

  useEffect(() => {
    costRef.current = paymentDetails.cost;
    creditsRef.current = paymentDetails.credits;
  }, [paymentDetails]);

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setIsLoaded(true);
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${
        import.meta.env.VITE_PAYPAL_CLIENT_ID
      }`;
      script.onload = () => {
        setIsLoaded(true);
        setLoading(false);
      };
      script.onerror = () => {
        toast.error("Failed to load PayPal script");
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      const paypalScript = document.querySelector(
        `script[src="https://www.paypal.com/sdk/js?client-id=${
          import.meta.env.VITE_PAYPAL_CLIENT_ID
        }"]`
      );
      if (paypalScript && document.body.contains(paypalScript)) {
        document.body.removeChild(paypalScript);
      }
    };
  }, []);

  useEffect(() => {
    setPaymentResult({ result: null, methord: null });
    if (APP == "beta") {
      document.title = "Buy Credits | Beta Dashboard";
    } else {
      document.title = "Buy Credits | Dashboard";
    }
  }, []);

  useEffect(() => {
    if (userDetails.accountDetailsModal) setAccountDetailsModal(true);
  }, [userDetails]);

  const createOrder = (data, actions) => {
    console.log(paymentDetails, "payment details");
    return actions.order
      .create({
        purchase_units: [
          {
            description: "Gamalogic Credits",
            amount: {
              currency_code: "USD",
              value: costRef.current,
            },
          },
        ],
      })
      .then((orderID) => {
        setOrderID(orderID);
        return orderID;
      });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async function () {
      try {
        await axiosInstance.post("/updateCredit", {
          credits: creditsRef.current,
          cost: costRef.current,
          data,
        });
        setPaymentResult({ result: true, methord: "payPal" });
        setCreditBal(creditBal + creditsRef.current);
        if (userDetails.expired?.status == true) {
          const storedToken = localStorage.getItem("Gamalogic_token");
          if (storedToken) {
            let token;
            try {
              token = JSON.parse(storedToken);
            } catch (error) {
              token = storedToken;
            }
            token.expired = null;
            localStorage.setItem("Gamalogic_token", JSON.stringify(token));
            setUserDetails(token);
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message;
        console.log(errorMessage,'error message')
        if (
          errorMessage ===
          "Please fill all the required fields to buy credits"
        ) {
          const storedToken = localStorage.getItem("Gamalogic_token");
          if (storedToken) {
            let token;
            try {
              token = JSON.parse(storedToken);
            } catch (error) {
              token = storedToken;
            }
            token.accountDetailsModal = true;
            localStorage.setItem("Gamalogic_token", JSON.stringify(token));
            setUserDetails(token);
          }
        }
        if (error.response && error.response.status === 500) {
          setServerError(true);
        } else {
          toast.error(error.response?.data?.error);
        }
      }
    });
  };
  const onError = async () => {
    toast.error("Error occured with our payment ");
    setPaymentResult({ result: false, methord: "payPal" });
    await axiosInstance.post("/paymentFailedEmail", { cost: costRef.current });
  };

  useEffect(() => {
    if (paymentResult.resutl == true) {
      toast.success("Payment successful!!");
    }
  }, []);

  const handleTryAgain = () => {
    setPaymentResult({ result: null, methord: null });
  };

  if (serverError) {
    return <ServerError />;
  }
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  return (
    <div className=" px-6 md:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Buy Credits"} />
      {accountDetailsModal && (
        <AccountDetailsModal isOpen={accountDetailsModal} />
      )}
      {paymentResult.result == null && (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          <h3>Pricing</h3>
          <p className="my-7 description">
            Choose the best pack that suits your needs from below. For custom
            quoting,
            <Link
              to="/dashboard/support"
              className="underline font-medium ml-1"
            >
              contact us.
            </Link>
          </p>
          {!accountDetailsModal && (<Pricing />)}
          {userDetails.confirm == 1 &&
            paymentDetails.type == "Pay As You Go" && (
              <div className="">
                <div className=" flex justify-center mt-6">
                  {isLoaded ? (
                    <div className="w-5/6 sm:w-3/6 md:w-2/6  z-0">
                      <PayPalButton
                        createOrder={(data, actions) =>
                          createOrder(data, actions)
                        }
                        onApprove={onApprove}
                        onError={onError}
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <button className="bg-yellow-400 px-24 py-2 font-bold rounded  italic text-blue-900">
                        Pay<span className="text-sky-600">Pal</span>
                      </button>
                      <p className="font-semibold text-sm">
                        The safer,easier way to pay{" "}
                      </p>
                    </div>
                  )}
                </div>
                <hr className="my-3" />
                <div className="text-center ">
                  <p className="text-xs mt-3">
                    *RazorPay is only for Indian users
                  </p>
                  <BuyCreditsRazorPay />{" "}
                </div>
              </div>
            )}
          {userDetails.confirm == 1 &&
            paymentDetails.type != "Pay As You Go" && (
              <div className="flex  justify-center">
                <div className="w-full flex flex-col justify-center items-center">
                  <PayPalSubscription />
                  <hr className="my-hr my-3" />
                  <div className="text-center ">
                    <p className="text-xs mt-3">
                      *RazorPay is only for Indian users
                    </p>
                    <BuyCreditsRazorPaySubsciption />{" "}
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
      {paymentResult.result == true && <PaymentSuccess />}
      {paymentResult.result == false && (
        <PaymentFailure tryAgain={handleTryAgain} />
      )}
    </div>
  );
}
