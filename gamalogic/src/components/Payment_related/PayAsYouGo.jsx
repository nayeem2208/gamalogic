import { useEffect, useState } from "react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useUserState } from "../../context/userContext";

function PayAsYouGo() {
    const [selectedCredits, setSelectedCredits] = useState(1000);
    const [cost, setCost] = useState(7);
    const {setPaymentDetails}=useUserState()
  
    const creditCostMappings = [
      [1000, 7],
      [2500, 16],
      [5000, 30],
      [10000, 40],
      [25000, 75],
      [50000, 125],
      [75000, 175],
      [100000, 200],
      [250000, 400],
      [500000, 600],
      [750000, 800],
      [1000000, 1000],
    ];
    const handleCreditsChange = (event) => {
      const value = event.target.value;
      event.target.style.setProperty(
        "--value",
        (value / (creditCostMappings.length - 1)) * 100 + "%"
      );
      const index = parseInt(event.target.value);
      const [credits, cost] = creditCostMappings[index];
      setSelectedCredits(credits);
      setCost(cost);
      setPaymentDetails(prevDetails => ({
        ...prevDetails,
        cost: cost,
        credits:credits
      }));    };


      
    useEffect(() => {
      setPaymentDetails({cost:7,type:'Pay As You Go',period:'',credits:1000});
      setTimeout(() => {
        const rangeInput = document.querySelector(".custom-range");
        if (rangeInput) {
          rangeInput.style.setProperty(
            "--value",
            (rangeInput.value / (creditCostMappings.length - 1)) * 100 + "%"
          );
        }
      }, 0);
    }, []);
  
    return (
      <div className="flex flex-col justify-center items-center w-full text-white">
        <div className="flex w-full  lg:w-3/6 text-center mt-6">
          <div className="w-3/6 border-r-4 border-gray-400">
            <p className=" text-2xl md:text-4xl font-extrabold">
              {selectedCredits.toLocaleString("en-US")}
            </p>
            <p className="md:text-lg">Credits</p>
          </div>
          <div className="w-3/6">
            <p className="text-2xl md:text-4xl font-extrabold">
              ${cost.toLocaleString("en-US")}
            </p>
            <p className="md:text-lg">Cost</p>
          </div>
        </div>
        <div className="w-5/6 md:w-3/5 mt-12">
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
        <div className="w-5/6 md:w-3/5 flex flex-col items-start my-4">
          <div className=" my-2 flex md:items-center">
            <IoMdCheckmarkCircle className="h-6 w-6 md:h-8 md:w-8 md:min-w-8  min-w-6 text-green-600 mr-3" />
            <p className="text-left">No contract, No monthly payment.</p>
          </div>
          <div className=" my-2 flex md:items-center">
            <IoMdCheckmarkCircle className="h-6 w-6 md:h-8 md:w-8 md:min-w-8  min-w-6 text-green-600 mr-3" />
            <p className="text-left">Credits never expire.</p>
          </div>
          <div className=" my-2 flex md:items-center">
            <IoMdCheckmarkCircle className="h-6 w-6 md:h-8 md:w-8 md:min-w-8  min-w-6 text-green-600 mr-3" />
            <p className="text-left">Credits can be used for email validation and finding.</p>
          </div>
        </div>
      </div>
    );
  }

  export default PayAsYouGo