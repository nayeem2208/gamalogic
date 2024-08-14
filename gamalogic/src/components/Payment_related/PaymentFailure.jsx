import React from "react";
import { PiWarningCircleLight } from "react-icons/pi";


function PaymentFailure({ tryAgain }) {
  return (
      <div className="flex justify-center items-center mt-16">
        <div className="payment-failure">
          <div className="flex justify-center">
            <PiWarningCircleLight
              style={{ fontSize: "15vw" }}
              className="font-extralight text-red-500 "
            />
          </div>
          <div className="text-center flex flex-col justify-center my-6">
          <h3 className="text-5xl">Oops!</h3>
          <p className="my-2">Your payment was unsuccessfull, please try again.</p>
          <p>
            If you are having any trouble, contact us at,{" "}
            <a class="dark" href="mailto:support@gamalogic.com">
              support@gamalogic.com
            </a>
          </p>

          <button className="underline font-semibold my-2" onClick={tryAgain}>
            TRY AGAIN
          </button>
          </div>
        </div>
      </div>
  );
}

export default PaymentFailure;
