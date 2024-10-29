import React from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";

function SubscriptionCancellationConfirmed() {
  return (
    <div className=" w-full  flex justify-center  mt-16">
      <div className="extra-page">
        <div className="text-center  " style={{ position: "relative" }}>
          {/* <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div> */}
          <h2 className=" text-4xl">Subscription Cancellation Request Confirmed</h2>
          <p className="my-8 ">Your request to cancel the subscription has been successfully confirmed.</p>
          <div className="flex justify-center">
            <GoVerified
              style={{ fontSize: "15vw" }}
              className="font-extralight text-green-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
          <p className=" text-center">
            We're sorry to see you go, but feel free to subscribe again anytime!
          </p>
          <div className="my-6 flex justify-center">
            <Link to="/dashboard/buy-credits">
              <button className="bg-bgblue py-1 px-4 rounded-md   mr-2 h-9 mt-8  text-white text-sm font-medium">
                BUY CREDITS
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCancellationConfirmed;
