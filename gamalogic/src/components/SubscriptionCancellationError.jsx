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
    <div className=" w-full  flex justify-center mt-16">

      <div className="extra-page">
        <div className="text-center  " >
          <h2 className=" text-4xl">Error Cancelling Subscription</h2>
          <p className="my-8  text-gray-800">{errorMessage}</p>
          <div className="flex justify-center">
            <MdErrorOutline
              style={{ fontSize: "15vw" }}
              className="font-extralight text-red-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
          <div className=" flex justify-center text-white">
            {error === "expired" ? (
              <Link to="/dashboard/billing">
                <button className="bg-red-500 py-1 px-4 rounded-md   mr-2 h-9   text-white text-sm font-medium">
                  Request New Link
                </button>
              </Link>
            ) : (
              <Link to="/dashboard/support">
                <button className="bg-red-500 py-1 px-4 rounded-md   mr-2 h-9   text-white text-sm font-medium">
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
