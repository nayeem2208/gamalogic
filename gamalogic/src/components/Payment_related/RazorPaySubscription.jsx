import React, { useEffect, useRef, useState } from "react";
import { useUserState } from "../../context/userContext";
// import RazorpayButton from "../components/Payment_related/RazorPayButton";
import { toast } from "react-toastify";
import RazorPaySubscriptionButton from "./RazorPaySubscriptionButton";

export default function BuyCreditsRazorPaySubsciption() {
  const [cost, setCost] = useState(847.46);
  let [serverError, setServerError] = useState(false);

  let {
    setCreditBal,
    creditBal,
    setPaymentResult,
    paymentDetails,
    setUserDetails,
    userDetails,
  } = useUserState();

  //   let creditCostMappings = [
  //     [1000,651],
  //     [2500, 1488],
  //     [5000, 2790],
  //     [10000, 3720],
  //     [25000, 6975],
  //     [50000, 11625],
  //     [75000, 16275],
  //     [100000, 18600],
  //     [250000, 37200],
  //     [500000, 55800],
  //     [750000, 74400],
  //     [1000000, 93000],
  //   ];

  //   useEffect(() => {
  //     const [credits, cost] = creditCostMappings.find(
  //       ([credits]) => credits === paymentDetails.credits
  //     ) || [2500, 847.46];

  //     setCost(cost);
  //   }, [paymentDetails.credits]);

  const handleSuccess = () => {
    setPaymentResult({ result: true, methord: "RazorPay" });
    setCreditBal(creditBal + paymentDetails.credits);
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
  };

  const handleFailure = (type) => {
    if (type === "serverError") {
      setServerError(true);
      setPaymentResult({ result: false, methord: "RazorPay" });
    }
  };
  return (
    <div className="text-center flex justify-center ">
      <RazorPaySubscriptionButton
        // cost={cost}
        credits={paymentDetails.credits}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
}
