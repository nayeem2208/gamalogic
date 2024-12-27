import React, { useEffect, useRef, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useUserState } from "../../context/userContext";
import axiosInstance, { APP } from "../../axios/axiosInstance";

const ButtonWrapper = ({ type }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    paymentDetails,
    setPaymentDetails,
    creditBal,
    paymentResult,
    setCreditBal,
    setPaymentResult,
    setUserDetails,
    userDetails,
  } = useUserState();
  const planIdRef = useRef("P-7NW45488DG075491MM25NWLY");
  const paymentDetailsref = useRef({});
  const [{ options }, dispatch] = usePayPalScriptReducer();

  let MonthlyCreditCostMappings;
  let AnnualCreditCostMappings;

  if (APP == "beta") {
    MonthlyCreditCostMappings = [
      [1000, 6, "P-7NW45488DG075491MM25NWLY"],
      [2500, 14, "P-1EE54055GV717671BM2452WA"],
      [5000, 25, "P-9Y912572NN1022200M2474NI"],
      [10000, 30, "P-93415479X9920982AM24743Y"],
      [25000, 65, "P-7G385911N36588604M25ADCQ"],
      [50000, 90, "P-0T292263UG2509001M25ADUY"],
      [75000, 125, "P-2RF042105E1959722M25AEHQ"],
      [100000, 150, "P-1J380710H8242232LM4ASSXI"],
      [250000, 230, "P-5PM81472KH310021MM25AFKY"],
      [500000, 400, "P-1TT15318H0322951PM25AF3I"],
      [750000, 600, "P-2700077055079150VM25AGJI"],
      [1000000, 800, "P-67S29215LN183245PM4ASNIY"],
    ];

    AnnualCreditCostMappings = [
      [1000, 60, "P-7NW45488DG075491MM25NWLY"],
      [2500, 144, "P-642861822H125174XM4LVR5I"],
      [5000, 240, "P-7AN44135WF1263455M4LVSOQ"],
      [10000, 300, "P-0U600409VG797471MM4LVTAA"],
      [25000, 660, "P-02V62927KD940054TM4LVTVA"],
      [50000, 780, "P-3BB69288VK398404BM4LVY7I"],
      [75000, 900, "P-80291684742965055M4LVUDY"],
      [100000, 1020, "P-3ER93865PV808691NM4LVUPA"],
      [250000, 2160, "P-03C33616VX263094JM4LVU5Y"],
      [500000, 4200, "P-2TD975038N187041SM4LVVLI"],
      [750000, 6300, "P-62F09829HV516111GM4LVVVQ"],
      [1000000, 8400, "P-7XA05716Y28451420M4LVV7Y"],
    ];
  } else {
    MonthlyCreditCostMappings = [
      [1000, 6, "P-72U39124UW699140VM3UVDJA"],
      [2500, 14, "P-95N96582N5110634CM3UVD5Y"],
      [5000, 25, "P-2BD09321277183631M3UVP6A"],
      [10000, 30, "P-0UP62863PB423183FM3UVSIY"],
      [25000, 65, "P-9TH53220UK3978158M3UVVLI"],
      [50000, 90, "P-6B194601HS928963XM3UVWRA"],
      [75000, 125, "P-78425286JB9223000M3U24TY"],
      [100000, 150, "P-5E207870S54825102M3U25NI"],
      [250000, 230, "P-92V14659CH4017010M3U26IQ"],
      [500000, 400, "P-9S581294M0625541AM3U27FA"],
      [750000, 600, "P-8L4996302T506635GM3U27UA"],
      [1000000, 800, "P-22G689928N540831NM3U3COQ"],
    ];

    AnnualCreditCostMappings = [
      [1000, 60, "P-09P99448F15622802M3U3DHA"],
      [2500, 144, "P-4P1083047P145962AM3U3EHQ"],
      [5000, 240, "P-8FJ05805WK865450TM3U3FKI"],
      [10000, 300, "P-86249996XY404550JM3U3GOA"],
      [25000, 660, "P-4PF792591V539335BM3U3HAY"],
      [50000, 780, "P-5C050367JW309282HM3U3IEI"],
      [75000, 900, "P-68C34773GY056461KM3U3JVA"],
      [100000, 1020, "P-73090635J8051762FM3U3KMQ"],
      [250000, 2160, "P-3RE78809304001220M3U3LII"],
      [500000, 4200, "P-43448757LG389983FM3U3MCI"],
      [750000, 6300, "P-6TY213663V394212CM3U3NFA"],
      [1000000, 8400, "P-8KU33391038351740M3U3OIY"],
    ];
  }

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
      paymentDetailsref.current = paymentDetails;
    } else {
      matchedPlan = AnnualCreditCostMappings.find(
        ([credits]) => credits === paymentDetails.credits
      );
      const annualCost = paymentDetails.cost * 12;
      const annualCredits = paymentDetails.credits;
      paymentDetailsref.current = {
        ...paymentDetails, // Keep existing properties
        cost: annualCost,
        credits: annualCredits,
      };
    }
    if (matchedPlan) {
      planIdRef.current = matchedPlan[2];
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
        paymentDetails: paymentDetailsref.current,
      };

      // Send data to your backend
      await axiosInstance.post("/payPalSubscription", orderData);
      setPaymentResult({ result: true, methord: "payPal" });
      setCreditBal(creditBal + paymentDetailsref.current);
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
      toast.success("Payment successful!!");

    } catch (error) {
      console.error(
        "Error handling approval or sending data to backend:",
        error
      );
      const errorMessage = error.response?.data?.message;
      if (
        errorMessage === "Please fill all the required fields to buy credits"
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
    }
  };
  return isLoaded ? (
    <PayPalButtons
      createSubscription={(data, actions) => {
        return actions.subscription
          .create({
            plan_id: planIdRef.current,
          })
          .then((orderId) => {
            return orderId;
          });
      }}
      onApprove={handleApprove}
      style={
        {
          // label: "subscribe",
        }
      }
    />
  ) : (
    <div className="text-center">
      <button className="bg-yellow-400 px-24 py-2 font-bold rounded  italic text-blue-900">
        Pay<span className="text-sky-600">Pal</span>
      </button>
      <p className="font-semibold text-sm">The safer,easier way to pay </p>
    </div>
  );
};
function PayPalSubscription() {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <div className="w-5/6 sm:w-3/6 md:w-2/6 mt-3 z-0 relative">
      <PayPalScriptProvider
        deferLoading={true}
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
