import React, { useEffect, useState } from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";
import { useUserState } from "../../context/userContext";
function PaymentSuccess() {
  let { paymentResult, paymentDetails } = useUserState();
  let [costToShow, setCostToShow] = useState(null);

  useEffect(() => {
    const creditCostMappings = [
      [1000, 651, 558, 465],
      [2500, 1488, 1302, 1116],
      [5000, 2790, 2325, 1860],
      [10000, 3720, 2790, 2325],
      [25000, 6975, 6045, 5115],
      [50000, 11625, 8370, 6045],
      [75000, 16275, 11625, 6975],
      [100000, 18600, 13950, 7905],
      [250000, 37200, 21390, 16740],
      [500000, 55800, 37200, 32550],
      [750000, 74400, 55800, 48825],
      [1000000, 93000, 74400, 65100],
    ];
    let selectedCost =paymentDetails.cost
    if (paymentResult.methord == "payPal") {
      if (paymentDetails.type !== "Pay As You Go") {
        if (paymentDetails.period === "monthly") {
          selectedCost = paymentDetails.cost;
        } else {
          selectedCost = paymentDetails.cost*12;
        }
      }
    } else {
      let index = 1; // Default to 'Pay As You Go'

      if (paymentDetails.type !== "Pay As You Go") {
        if (paymentDetails.period === "monthly") {
          index = 2;
        } else {
          index = 3;
        }
      }

      const costMapping = creditCostMappings.find(
        ([credits]) => credits === paymentDetails.credits
      );
      if (costMapping) {
        if (paymentDetails.period === "annually") {
        selectedCost = costMapping[index]*12;
        }
        else{
          selectedCost = costMapping[index];
        }
      }
    }


    if (selectedCost) {
      setCostToShow(selectedCost);
    }
  }, [paymentResult.method, paymentDetails.credits]);

  const displayCredits = paymentDetails.credits;

  return (
    <div className="flex justify-center items-center mt-16">
      <div className="payment-success">
        <div className="flex justify-center">
          <GoVerified
            style={{ fontSize: "15vw" }}
            className="font-extralight text-green-500 "
          />
        </div>
        {paymentDetails.type=='Pay As You Go'?<div className="text-center flex flex-col justify-center my-6">
          <h3 className="text-5xl">Payment Success!</h3>
          <p className="my-2">
            Your payment of{" "}
            {paymentResult.methord === "payPal"
              ? `$${
                  costToShow !== null
                    ? costToShow.toLocaleString("en-US")
                    : "Loading..."
                }`
              : `₹${
                  costToShow !== null
                    ? Math.round(
                        costToShow + (costToShow * 18) / 100
                      ).toLocaleString("en-US")
                    : //  + ` (${costToShow.toLocaleString("en-US")} + 18%)`
                      "Loading..."
                }`}{" "}
            for {displayCredits.toLocaleString("en-US")}  credits was
            successfull.
          </p>
          <p>You can now continue using our services.</p>

          <Link to="/" className="underline font-semibold my-2">
            START VALIDATING
          </Link>
        </div>:
        <div className="text-center flex flex-col justify-center my-6">
        <h3 className="text-5xl">Payment Success!</h3>
        <p className="my-2">
          Your payment of{" "}
          {paymentResult.methord === "payPal"
            ? `$${
                costToShow !== null
                  ? costToShow.toLocaleString("en-US")
                  : "Loading..."
              }`
            : `₹${
                costToShow !== null
                  ? 
                  // Math.round(
                  //     costToShow + (costToShow * 18) / 100
                  //   ).toLocaleString("en-US")
                  costToShow.toLocaleString("en-US")
                  : //  + ` (${costToShow.toLocaleString("en-US")} + 18%)`
                    "Loading..."
              }`}{" "}
          for {displayCredits.toLocaleString("en-US")}  credits was
          successfull and your {paymentDetails.period=='monthly'?'monthly':'annual'} subscription has been activated.
        </p>
        <p>You can now continue enjoying our services with your monthly credits.</p>

        <Link to="/" className="underline font-semibold my-2">
          START VALIDATING
        </Link>
      </div>
        }
      </div>
    </div>
  );
}

export default PaymentSuccess;
