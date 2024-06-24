import React, { useEffect, useRef, useState } from "react";
import { useUserState } from "../context/userContext";
import SubHeader from "../components/SubHeader";
import { Link } from "react-router-dom";
import RazorpayButton from "../components/RazorPayButton";
import PaymentSuccess from "../components/PaymentSuccess";
import PaymentFailure from "../components/PaymentFailure";

export default function BuyCreditsRazorPay({creditfrom}) {
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [orderID, setOrderID] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(2500);
  const [cost, setCost] = useState(847.46);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  let [serverError, setServerError] = useState(false);

  let { setCreditBal, creditBal, userDetails } = useUserState();
  const creditsRef = useRef(selectedCredits);
  console.log(creditfrom,'creditFrom')

  let creditCostMappings = [
    [2500, 847.46],
    [5000, 1271.19],
    [10000, 1864.41],
    [25000, 3474.58],
    [50000, 6355.93],
    [75000, 8474.58],
    [100000, 10169.49],
    [250000, 23728.81],
    [500000, 44067.8],
    [750000, 63559.32],
    [1000000, 72033.9],
    [2500000, 186440.68],
  ];

  useEffect(() => {
    const [credits, cost] = creditCostMappings.find(
      ([credits]) => credits === creditfrom
    ) || [2500, 847.46]; 

    setSelectedCredits(credits);
    setCost(cost);
  }, [creditfrom]);

  const handleSuccess = () => {
    setSuccess(true);
    setCreditBal(creditBal + creditsRef.current);
    toast.success("Payment successful!!");
  };

  const handleFailure = (type) => {
    if (type === "serverError") {
      setServerError(true);
    } else {
      setFailure(true);
    }
  };
  return (
    <div className="text-center flex justify-center ">
      <RazorpayButton
        cost={cost}
        credits={selectedCredits}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
}
