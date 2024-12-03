import React, { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import { APP } from "../axios/axiosInstance";
import { FaGift } from "react-icons/fa6";
import { toast } from "react-toastify";

function EarnPoints() {
  const [showRewardsButton, setShowRewardsButton] = useState(false);
  useEffect(() => {
    if (APP == "beta") {
      document.title = "Loyalty | Beta Dashboard";
    } else {
      document.title = "Loyalty | Dashboard";
    }
    window.hideThriveWidget = false;
    // window.reloadThriveWidget();
  }, []);

  useEffect(()=>{
    const timer = setTimeout(() => {
      setShowRewardsButton(true);
    }, 3000);

    return () => clearTimeout(timer); //
  },[])

  const handleAffiliateUser=()=>{
    toast.info('Affiliate user cant make free credits through loyalty')
  }

  return (
    <div className="earn-points-container px-6 md:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Earn Points"} />
      <div className="mt-6 sm:mt-14">
        <h3 className=" font-semibold text-2xl">
          Gamalogic Loyalty Program: Rewarding Your Commitment
        </h3>
        <p className="my-7 description">
          At Gamalogic, we value our customers and believe in building lasting
          relationships. Our Loyalty Program is designed to reward your
          commitment to our solutions, empowering you to grow and succeed while
          unlocking exclusive benefits.
        </p>

        {/* Loyalty Benefits */}
        <div className="loyalty-benefits my-10">
          <h4 className="font-semibold text-lg ">
            Why Join the Gamalogic Loyalty Program?
          </h4>
          <ol className="list-decimal list-inside  mt-4 font-semibold">
            <li className="mt-4">
              Earn Rewards Effortlessly <br />
              <span className="font-normal">
                Every action you take with Gamalogic brings value to your
                business, and now it brings rewards too! Earn points for
                engagement.
              </span>
            </li>
            <li className="mt-4">
              {" "}
              Unlock Exclusive Benefits <br />
              <span className="font-normal">
                {" "}
                Redeem your loyalty points for early access to new product
                updates. Stay ahead in your industry with these exclusive perks.{" "}
              </span>
            </li>
            <li className="mt-4">
              Flexible and Transparent System <br />
              <span className="font-normal">
                Our loyalty program is easy to understand, with a clear points
                system that ensures you know exactly what you’re earning and how
                you can use it.{" "}
              </span>
            </li>
          </ol>
        </div>

        <div className="loyalty-benefits my-10">
          <h4 className="font-semibold text-lg ">How It Works</h4>
          <ol className="list-decimal list-inside  mt-4">
            <li className="mt-3 font-semibold">
              Enrolling is easy and free. Simply click on the button at the
              bottom left of this page to access our loyalty program.
            </li>
            <li className="mt-3 font-semibold">
              Earn Points <br />
              <ol className="list-inside ml-6 font-normal">
                <li className="my-1">a. Click on the rewards button</li>
                <li className="my-1">b. Navigate to the Reviews section</li>
                <li className="my-1">c. Click on the "Ways to Share" button</li>
                <li className="my-1">d. Select any services to review</li>
                <li className="my-1">e. Submit the link for approval</li>
              </ol>
            </li>
            <li className="mt-3 font-semibold">
              How to Redeem Rewards <br />
              <ol className="list-inside ml-6 font-normal">
                <li className="my-1">a. Click on the rewards button</li>
                <li className="my-1">b. Click on the redeem button</li>
                <li className="my-1">
                  c. In the customer reward section, click on redeem
                </li>
                <li className="my-1">d. Click on "Yes, redeem"</li>
                <li className="my-1">e. Wait for the successful message</li>
                <li className="my-1">
                  f. Refresh your page to check updated credits
                </li>
                <li className="my-1">
                  g. You will earn one credit for each point
                </li>
              </ol>
            </li>
          </ol>
        </div>

        <div className="social-media my-10">
          <p className="my-4 ">
            Take your partnership with Gamalogic to the next level. Whether
            you’re a startup or an established business, our Loyalty Program
            ensures every interaction is more rewarding.
          </p>
          <p>
            Start earning rewards today—because loyalty deserves recognition.
          </p>
        </div>
      </div>
      <div className="hidden  2xl:mt-14  bottom-24 left-0 lg:flex flex-col mb-9   w-1/2 items-end ">
        <p className="text-left  w-full flex items-center">
          You can earn free credits by clicking the{" "}
          <button className=" ml-3 bg-bgblue rounded-full text-sm font-semibold h-14 w-36 text-white flex justify-center items-center">
            <FaGift className="mr-2 w-5 h-5" /> Rewards
          </button>
        </p>
        <div className="flex justify-start items-center  w-2/3">
          <img
            src="/curved-arrow.png"
            alt="Curved Arrow"
            className="w-16 h-16 lg:w-28 lg:h-28 2xl:w-36 2xl:h-36 opacity-20"
          />
        </div>
      </div>
      {showRewardsButton && (
        <button className="fixed left-[340px] bottom-[50px] ml-3 bg-bgblue rounded-full text-sm font-semibold h-14 w-36 text-white flex justify-center items-center" onClick={handleAffiliateUser}>
          <FaGift className="mr-2 w-5 h-5" /> Rewards
        </button>
      )}
    </div>
  );
}

export default EarnPoints;
