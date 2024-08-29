import React, { useEffect, useRef, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useUserState } from "../../context/userContext";
import axiosInstance from "../../axios/axiosInstance";

const ButtonWrapper = ({ type }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    paymentDetails,
    setPaymentDetails,
    creditBal,
    paymentResult,
    setCreditBal,
    setPaymentResult,
  } = useUserState();
  const planIdRef = useRef("P-7NW45488DG075491MM25NWLY");
  const paymentDetailsref=useRef({})
  const [{ options }, dispatch] = usePayPalScriptReducer();

  const MonthlyCreditCostMappings = [
    [1000, 6, "P-7NW45488DG075491MM25NWLY"],
    [2500, 14, "P-1EE54055GV717671BM2452WA"],
    [5000, 25, "P-9Y912572NN1022200M2474NI"],
    [10000, 30, "P-93415479X9920982AM24743Y"],
    [25000, 65, "P-7G385911N36588604M25ADCQ"],
    [50000, 90, "P-0T292263UG2509001M25ADUY"],
    [75000, 125, "P-2RF042105E1959722M25AEHQ"],
    [100000, 150, "P-4EE36151CK288270NM25AE4A"],
    [250000, 230, "P-5PM81472KH310021MM25AFKY"],
    [500000, 400, "P-1TT15318H0322951PM25AF3I"],
    [750000, 600, "P-2700077055079150VM25AGJI"],
    [1000000, 800, "P-4U4028875R361382AM3BRMRQ"],
  ];

  const AnnualCreditCostMappings = [
    [1000, 60, "P-4T618071TT039610MM3BROHY"],
    [2500, 144, "P-1CU327045R943371FM3BRPVI"],
    [5000, 240, "P-1LG25877VL011492YM3BRRBY"],
    [10000, 300, "P-88916218AL1394515M3BSW3A"],
    [25000, 660, "P-4HH18885DY070713EM3BSXSY"],
    [50000, 780, "P-5EG25322401701724M3BT4RI"],
    [75000, 900, "P-59T20254AP482644UM3BT5GA"],
    [100000, 1020, "P-2D194344DY3417204M3BUBTI"],
    [250000, 2160, "P-71956783FR6971015M3BUCPY"],
    [500000, 4200, "P-7AX199510N4348730M3BUDHI"],
    [750000, 6300, "P-5RP18690UV262063EM3BUD5Q"],
    [1000000, 8400, "P-3XJ08785U0027370EM3BUEZY"],
  ];

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${
        import.meta.env.VITE_PAYPAL_CLIENT_ID
      }`;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        toast.error("Failed to load PayPal script");
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
    let matchedPlan;
    if (
      paymentDetails.type == "Subscription" &&
      paymentDetails.period == "monthly"
    ) {
      matchedPlan = MonthlyCreditCostMappings.find(
        ([credits]) => credits === paymentDetails.credits
      );
      paymentDetailsref.current=paymentDetails

    } else {
      matchedPlan = AnnualCreditCostMappings.find(
        ([credits]) => credits === paymentDetails.credits
      );
      const annualCost = paymentDetails.cost * 12;
      const annualCredits = paymentDetails.credits * 12;
      paymentDetailsref.current = {
        ...paymentDetails,  // Keep existing properties
        cost: annualCost,
        credits: annualCredits,
      };
    }
    if (matchedPlan) {
      planIdRef.current = matchedPlan[2];
      console.log("Plan ID Updated To:", planIdRef.current); // Debugging line
    } else {
      console.warn(
        "No matching plan found for credits:",
        paymentDetails.credits
      ); // Debugging line
    }

  }, [paymentDetails]);

  useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        intent: "subscription",
      },
    });
  }, [type]);

  const handleApprove = async (data, actions) => {
    try {
      const subscription = await actions.subscription.get();

      const orderData = {
        subscriptionId: subscription.id,
        planId: planIdRef.current,
        payerId: data.payerID,
        paymentDetails:paymentDetailsref.current,
      };

      // Send data to your backend
      await axiosInstance.post("/payPalSubscription", orderData);
      setPaymentResult({ result: true, methord: "payPal" });
      setCreditBal(creditBal + paymentDetailsref.current);

      console.log("Order details sent to backend successfully");
    } catch (error) {
      console.error(
        "Error handling approval or sending data to backend:",
        error
      );
    }
  };
  console.log(paymentDetails,'payment details')
  return (
    <PayPalButtons
      createSubscription={(data, actions) => {
        return actions.subscription
          .create({
            plan_id: planIdRef.current,
          })
          .then((orderId) => {
            console.log(planIdRef.current, "plan id");
            return orderId;
          });
      }}
      onApprove={handleApprove}
      style={{
        label: "subscribe",
      }}
    />
  );
};
function PayPalSubscription() {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <div className="w-5/6 sm:w-3/6 md:w-2/6 mt-3 z-0 relative">
      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          components: "buttons",
          intent: "subscription",
          vault: true,
        }}
      >
        <ButtonWrapper type="subscription" />
      </PayPalScriptProvider>
    </div>
  );
}

export default PayPalSubscription;
