import React, { useEffect, useRef, useState } from "react";
import { useUserState } from "../context/userContext";
import RazorpayButton from "../components/RazorPayButton";

export default function BuyCreditsRazorPay({creditfrom}) {

  const [selectedCredits, setSelectedCredits] = useState(2500);
  const [cost, setCost] = useState(847.46);
  let [serverError, setServerError] = useState(false);

  let { setCreditBal, creditBal,setPaymentResult } = useUserState();
  const creditsRef = useRef(selectedCredits);
  

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
    setPaymentResult({result:true,methord:'RazorPay'})
    setCreditBal(creditBal + creditsRef.current);
    toast.success("Payment successful!!");
  };

  const handleFailure = (type) => {
    if (type === "serverError") {
      setServerError(true);
      setPaymentResult({result:false,methord:'RazorPay'})
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
