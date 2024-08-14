import React, {useState } from "react";
import PayAsYouGo from "./PayAsYouGo";
import Subscription from "./Subsciption";


function Pricing() {
  const [isSubscription, setIsSubscription] = useState(false);

  return (
    <div className="flex justify-center flex-col items-center">
      <div className="flex h-12 rounded-t-xl w-4/5 lg:w-2/5 justify-between font-semibold">
        <div
          onClick={() => setIsSubscription(false)}
          className={`text-center flex justify-center items-center w-3/6 rounded-tl-xl z-10  cursor-pointer ${
            !isSubscription
              ? "bg-bgblue text-white font-bold text-xs sm:text-base"
              : "bg-gray-300 text-bgblue   border-slate-200 text-xs md:text-sm shadow-inner"
          }`}
        >
          PAY AS YOU GO
        </div>
        <div
          onClick={() => setIsSubscription(true)}
          className={`text-center flex justify-center items-center w-3/6 rounded-tr-xl z-10 text-sbg-slate-400 cursor-pointer ${
            isSubscription
              ? "bg-bgblue text-white font-bold text-xs sm:text-base"
              : "bg-gray-300 text-bgblue   border-slate-200 text-xs sm:text-base shadow-inner"
          }`}
        >
          SUBSCRIPTION
        </div>
      </div>
      <div
        className="w-full xl:w-5/6 max-w-5xl pt-5 pb-9 min-h-96 h-full rounded-2xl flex flex-col justify-center items-center text-sbg-slate-400 shadow-xl bg-bgblue"
      >
        {isSubscription ? (
          <Subscription  />
        ) : (
          <PayAsYouGo  />
        )}
      </div>
    </div>
  );
}

export default Pricing;
