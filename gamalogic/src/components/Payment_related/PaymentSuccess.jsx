import React, { useEffect, useState } from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";
import { useUserState } from "../../context/userContext";


function PaymentSuccess() {
  let { paymentResult,paymentDetails } = useUserState();
  let [costToShow,setCostToShow]=useState(null)


  useEffect(() => {
    const creditCostMappingsPayPal = [
      [1000, 7],
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
      [1000,651],
      [2500, 1488],
      [5000, 2790],
      [10000, 3720],
      [25000, 6975],
      [50000, 11625],
      [75000, 16275],
      [100000, 18600],
      [250000, 37200],
      [500000, 55800],
      [750000, 74400],
      [1000000, 93000],
    ];


    const selectedMappings = paymentResult.methord == "payPal" ? creditCostMappingsPayPal : creditCostMappingsOther;
    const selectedCost = selectedMappings.find(([credits]) => credits === paymentDetails.credits);

    if (selectedCost) {
      setCostToShow(selectedCost[1]); 
    }
  }, [paymentResult.methord, paymentDetails.credits]);

  
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
            Your payment of {paymentResult.methord === "payPal" ? `$${costToShow !== null ? costToShow.toLocaleString("en-US") : "Loading..."}` : `₹${costToShow !== null ? (Math.round(costToShow + (costToShow * 18 / 100))).toLocaleString("en-US")
            //  + ` (${costToShow.toLocaleString("en-US")} + 18%)`
              : "Loading..."}`}
            {" "} for{" "}
            {paymentDetails.credits.toLocaleString("en-US")} credits was
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
