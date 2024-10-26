import React from "react";
import { MdErrorOutline } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

function SubscriptionCancellationError({error}) {
  

  let errorMessage = "There was an issue verifying your cancellation request.";
  if (error === "expired") {
    errorMessage = "The verification link has expired. Please request a new cancellation link.";
  } else if (error === "invalid") {
    errorMessage = "The verification link is invalid. Please try again or contact support.";
  }

  return (
    <div className=" w-full min-h-screen flex justify-center mt-16">

      <div className="extra-page">
        <div className="text-center auth " >
          <h2 className="font-semibold text-4xl">Error Cancelling Subscription</h2>
          <p className="my-12  text-gray-800">{errorMessage}</p>
          <div className="flex justify-center">
            <MdErrorOutline
              style={{ fontSize: "15vw" }}
              className="font-extralight text-red-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
          <div className="my-6 flex justify-center text-white">
            {error === "expired" ? (
              <Link to="/dashboard/billing">
                <button className="bg-red-500 rounded-lg py-2 font-semibold px-4 ">
                  Request New Link
                </button>
              </Link>
            ) : (
              <Link to="/dashboard/support">
                <button className="bg-red-500 rounded-lg py-2 font-semibold px-4 ">
                  Contact Support
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCancellationError;
