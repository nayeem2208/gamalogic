import React from "react";
import { GoVerified } from "react-icons/go";
import { Link } from "react-router-dom";

function SubscriptionCancellationConfirmed() {
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center text-white">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        </Link>
      </div>
      <div className="extra-page">
        <div className="text-center auth " style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Subscription Cancellation Request Confirmed</h2>
          <p className="my-12 description">Your request to cancel the subscription has been successfully confirmed.</p>
          <div className="flex justify-center">
            <GoVerified
              style={{ fontSize: "15vw" }}
              className="font-extralight text-cyan-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
          <p className="description font-thin text-center">
            We're sorry to see you go, but feel free to subscribe again anytime!
          </p>
          <div className="my-6 flex justify-center">
            <Link to="/">
              <button className="bg-red-500 rounded-lg py-2 font-semibold px-4 ">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCancellationConfirmed;
