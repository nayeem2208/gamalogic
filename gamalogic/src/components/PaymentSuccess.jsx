import React, { useEffect, useState } from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";
import { useUserState } from "../context/userContext";
function PaymentSuccess({ data }) {
  let { paymentResult } = useUserState();
  let [costToShow,setCostToShow]=useState(null)
  useEffect(() => {
    const creditCostMappingsPayPal = [
      [2500, 10],
      [5000, 15],
      [10000, 20],
      [25000, 40],
      [50000, 70],
      [75000, 100],
      [100000, 120],
      [250000, 280],
      [500000, 480],
      [750000, 700],
      [1000000, 960],
      [2500000, 2200],
    ];

    const creditCostMappingsOther = [
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

    const selectedMappings = paymentResult.methord == "payPal" ? creditCostMappingsPayPal : creditCostMappingsOther;
    console.log(selectedMappings,'selected mappingssssss')
    const selectedCost = selectedMappings.find(([credits]) => credits === data.selectedCredits);

    if (selectedCost) {
      setCostToShow(selectedCost[1]); 
    }
  }, [paymentResult.method, data.selectedCredits]);

  
  return (
    <div className="flex justify-center items-center mt-16">
      <div className="payment-success">
        <div className="flex justify-center">
          <GoVerified
            style={{ fontSize: "15vw" }}
            className="font-extralight text-green-500 "
          />
        </div>
        <div className="text-center flex flex-col justify-center my-6">
          <h3 className="text-5xl">Payment Success!</h3>
          <p className="my-2">
            Your payment of {paymentResult.method === "payPal" ? `$${costToShow !== null ? costToShow.toLocaleString("en-US") : "Loading..."}` : `₹${costToShow !== null ? (Math.round(costToShow + (costToShow * 18 / 100))).toLocaleString("en-US") + ` (${costToShow.toLocaleString("en-US")} + 18%)` : "Loading..."}`}
             for{" "}
            {data.selectedCredits.toLocaleString("en-US")} credits was
            successfull.
          </p>
          <p>You can now continue using our services.</p>

          <Link to="/" className="underline font-semibold my-2">
            START VALIDATING
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
