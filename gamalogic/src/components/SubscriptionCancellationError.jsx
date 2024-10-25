import React from "react";
import { MdErrorOutline } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

function SubscriptionCancellationError() {
  const location = useLocation();
  const error = new URLSearchParams(location.search).get("error");

  let errorMessage = "There was an issue verifying your cancellation request.";
  if (error === "expired") {
    errorMessage = "The verification link has expired. Please request a new cancellation link.";
  } else if (error === "invalid") {
    errorMessage = "The verification link is invalid. Please try again or contact support.";
  }

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
          <h2 className="font-semibold text-4xl">Error Cancelling Subscription</h2>
          <p className="my-12 description">{errorMessage}</p>
          <div className="flex justify-center">
            <MdErrorOutline
              style={{ fontSize: "15vw" }}
              className="font-extralight text-red-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
          <div className="my-6 flex justify-center">
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
