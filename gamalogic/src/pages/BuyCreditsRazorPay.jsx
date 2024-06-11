import React, { useRef, useState } from "react";
import { useUserState } from "../context/userContext";
import SubHeader from "../components/SubHeader";
import { Link } from "react-router-dom";
import RazorpayButton from "../components/RazorPayButton";
import PaymentSuccess from "../components/PaymentSuccess";
import PaymentFailure from "../components/PaymentFailure";

export default function BuyCreditsRazorPay() {
    const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [orderID, setOrderID] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(2500);
  const [cost, setCost] = useState(847.46);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  let [serverError, setServerError] = useState(false);

  let { setCreditBal, creditBal, userDetails } = useUserState();
  const costRef = useRef(cost);
  const creditsRef = useRef(selectedCredits);

    let creditCostMappings = [
        [2500, 847.46],
        [5000,1271.19],
        [10000, 1864.41],
        [25000, 3474.58],
        [50000, 6355.93],
        [75000, 8474.58],
        [100000, 10169.49],
        [250000, 23728.81],
        [500000, 44067.80],
        [750000, 63559.32],
        [1000000, 72033.90],
        [2500000, 186440.68],
      ];  

      const handleCreditsChange = (event) => {
        const value = event.target.value;
        event.target.style.setProperty(
          "--value",
          (value / (creditCostMappings.length - 1)) * 100 + "%"
        );
        const index = parseInt(event.target.value);
        if (index >= 0 && index < creditCostMappings.length) {
          const [credits, cost] = creditCostMappings[index];
          setSelectedCredits(credits);
          setCost(cost);
        } else {
          console.error("Invalid index for creditCostMappings:", index);
        }
      };

      const handleSuccess = () => {
        setSuccess(true);
        setCreditBal(creditBal + creditsRef.current);
        toast.success("Payment successful!!");
      };
    
      const handleFailure = (type) => {
        if (type === "serverError") {
          setServerError(true);
        } else {
          setFailure(true);
        }
      };
  return (
    <div className=" px-6 md:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Buy Credits"} />
      {success == false && failure == false && (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          <h3>Pricing</h3>
          <p className="my-7 description">
            Choose the best pack that suits your needs from below. For custom
            quoting,
            <Link
              to="/dashboard/support"
              className="underline font-medium ml-1"
            >
              contact us.
            </Link>
          </p>
          <div className="bg-gray-100 rounded h-52 md:h-96 shadow flex flex-col justify-center items-center">
            <div className="flex w-full text-center">
              <div className="w-3/6 border-r-4 border-gray-400">
                <p className="buyCreditsCost text-xl md:text-3xl font-medium">
                  {selectedCredits.toLocaleString("en-US")}
                </p>
                <p>Credits</p>
              </div>
              <div className="w-3/6">
                <p className="buyCreditsCost text-xl md:text-3xl font-medium">
                ₹{cost.toLocaleString("en-US")}
                </p>
                <p>Cost</p>
              </div>
            </div>
            <div className=" w-3/5 mt-12">
              <input
                type="range"
                className="w-full custom-range"
                min="0"
                max={creditCostMappings.length - 1}
                step="1"
                onChange={handleCreditsChange}
                value={creditCostMappings.findIndex(
                  ([credits]) => credits === selectedCredits
                )}
              />
            </div>
          </div>
          <div className="text-center flex justify-center">
            <RazorpayButton
              cost={cost}
              credits={selectedCredits}
              onSuccess={handleSuccess}
              onFailure={handleFailure}
            />
          </div>
        </div>
      )}
      {success == true && <PaymentSuccess data={{ cost, selectedCredits }} />}
      {failure == true && <PaymentFailure tryAgain={handleTryAgain} />}
    </div>
  );
}
