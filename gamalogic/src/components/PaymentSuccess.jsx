import React from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";
function PaymentSuccess({ data }) {
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
          Your payment of ${data.cost.toLocaleString("en-US")} for {data.selectedCredits.toLocaleString("en-US")} credits was
          successfull.
        </p>
        <p>You can now continue using our services.</p>

        
          <Link to="/" className="underline font-semibold my-2">START VALIDATING</Link>
        
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
