import React, { useEffect, useState } from "react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import { motion, useAnimation } from "framer-motion";

function PayAsYouGo({ onCostAndTypeChange }) {
  const [selectedCredits, setSelectedCredits] = useState(1000);
  const [cost, setCost] = useState(7);

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
  };
  useEffect(() => {
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

  useEffect(() => {
    onCostAndTypeChange(cost, 'PayAsYouGo', '');
  }, [cost, onCostAndTypeChange]);
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
          // max="8"
          max={creditCostMappings.length - 1}
          step="1"
          // value="2"
          onChange={handleCreditsChange}
          value={creditCostMappings.findIndex(
            ([credits]) => credits === selectedCredits
          )}
        />
      </div>
      <div className="w-5/6 md:w-3/6 flex flex-col items-center my-4">
        <div className=" my-2 flex md:items-center">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          dummy text of the printing and typesetting
        </div>
        <div className=" my-2 flex md:items-center">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          dummy text of the printing and typesetting
        </div>
        <div className=" my-2 flex md:items-center">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          dummy text of the printing and typesetting
        </div>
      </div>
    </div>
  );
}

function Subscription({ onCostAndTypeChange }) {
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedCredits, setSelectedCredits] = useState(1000);
  const [cost, setCost] = useState(6);
  const [save, setSave] = useState(14);
  const [actualPrice, setActualPrice] = useState(7);

  const controls = useAnimation();
  const controls2 = useAnimation();


  const monthlyCreditCostMappings = [
    [1000, 6, 14, 7],
    [2500, 14, 13, 16],
    [5000, 25, 17, 30],
    [10000, 30, 25, 40],
    [25000, 65, 13, 75],
    [50000, 90, 28, 125],
    [75000, 125, 29, 175],
    [100000, 150, 25, 200],
    [250000, 230, 43, 400],
    [500000, 400, 33, 600],
    [750000, 600, 25, 800],
    [1000000, 800, 20, 1000],
  ];

  const annualCreditCostMappings = [
    [1000, 5, 29, 6],
    [2500, 12, 25, 14],
    [5000, 20, 33, 25],
    [10000, 25, 38, 30],
    [25000, 55, 27, 65],
    [50000, 65, 48, 90],
    [75000, 75, 57, 125],
    [100000, 85, 58, 150],
    [250000, 180, 55, 230],
    [500000, 350, 42, 400],
    [750000, 525, 34, 600],
    [1000000, 700, 30, 800],
  ];

  const creditCostMappings = isMonthly
    ? monthlyCreditCostMappings
    : annualCreditCostMappings;

  useEffect(() => {
    const index = creditCostMappings.findIndex(
      ([credits]) => credits === selectedCredits
    );
    if (index !== -1) {
      const [, cost, save, actualPrice] = creditCostMappings[index];
      setCost(cost);
      setSave(save);
      setActualPrice(actualPrice);
      onCostAndTypeChange(cost, 'Subscription', isMonthly ? 'Monthly' : 'Annually');
    }
  }, [isMonthly, creditCostMappings, selectedCredits,onCostAndTypeChange]);

  const handleCreditsChange = (event) => {
    const value = event.target.value;
    event.target.style.setProperty(
      "--value",
      (value / (creditCostMappings.length - 1)) * 100 + "%"
    );
    const index = parseInt(event.target.value, 10);
    const [credits, cost] = creditCostMappings[index];
    setSelectedCredits(credits);
    setCost(cost);
  };

  useEffect(() => {
    const rangeInput = document.querySelector(".custom-range");
    if (rangeInput) {
      rangeInput.style.setProperty(
        "--value",
        (rangeInput.value / (creditCostMappings.length - 1)) * 100 + "%"
      );
    }
  }, [creditCostMappings]);

  const toggleState = async () => {
    setIsMonthly((prev) => !prev);
    
    await Promise.all([
      controls.start({
        opacity: 0,
        x: 100,
        y: 50,
        scale: 1,
        transition: { duration: 0.5 },
      }),
      controls2.start({
        opacity: 0,
        x: -100,
        y: -50,
        scale: 1,
        transition: { duration: 0.5 },
      })
    ]);
  
    await Promise.all([
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 1 },
      }),
      controls2.start({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 1 },
      })
    ]);
  };
  
  

  useEffect(()=>{
    controls.start({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 1 },
    });
    controls2.start({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 1 },
    })
  },[])

  // const handleClick = () => {
  //   controls.start({
  //     opacity: 1,
  //     x: 0,
  //     y: 0,
  //     scale: 1,
  //     transition: { duration: 1 },
  //   });
  // };


  return (
    <div className="flex flex-col justify-center items-center w-full text-white">
      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center md:justify-between w-10/12 mt-2 mb-6">
        <div
          className="border border-white rounded-3xl flex items-center text-xs"
          onClick={toggleState}
        >
          <button
            className={`${
              isMonthly
                ? "bg-white text-bgblue font-bold hover:text-sbg-slate-400"
                : ""
            } px-4 py-2 rounded-3xl`}
          >
            MONTHLY
          </button>
          <button
            className={`${
              !isMonthly ? "bg-white text-bgblue font-bold" : ""
            } px-4 py-2 rounded-3xl`}
          >
            ANNUALLY
          </button>
        </div>
        <motion.div
          initial={{ opacity: -100 }}
          animate={{ opacity: 100 }}
          transition={{ duration: 3 }}
          className="bg-green-600 hover:bg-green-800 w-36 p-1 mt-6 md:mt-0 rounded text-white flex items-center justify-center"
        >
          <p className="font-semibold text-sm md:text-lg text-center">Save {save}%</p>
          <button className="group relative inline-flex items-center justify-center text-sm font-medium">
            <IoInformationCircleOutline className="w-5 h-5 text-white ml-2" />
            <div className="ease-in duration-300 opacity-0 group-hover:block group-hover:opacity-100 transition-all">
              <div className="ease-in-out duration-500 -translate-y-4 pointer-events-none transition-all group-hover:-translate-y-16 absolute left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-sm text-center text-sm text-slate-300 before:-top-2">
                <div className="rounded-sm bg-green-900 py-1 px-2">
                  {!isMonthly?<p className="whitespace-nowrap">on monthly pricing</p>:<p className="whitespace-nowrap">on Pay as you go</p>}
                </div>
                <div className="h-0 w-fit border-l-8 border-r-8 border-t-8 border-transparent border-t-green-900"></div>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Credits and Cost Section */}
      <div className="flex w-full lg:w-4/6 text-center  items-end md:items-center h-24  md:h-48 ">
        {/* Credits Section */}
        <div className="flex flex-col items-center  flex-1 px-4 py-2  h-16">
          <p className="text-2xl md:text-4xl font-extrabold ">
            {selectedCredits.toLocaleString("en-US")}
          </p>
          <p className="md:text-lg">Credits</p>
        </div>

        {/* Vertical Line */}
        <div className="w-1 bg-gray-400 h-12 md:h-24 mx-2 md:mx-4"></div>

        {/* Cost Section */}
        <div className="flex flex-col flex-1  py-2 w-56  mt-10 justify-center md:justify-normal items-center h-20 md:h-full ">
          <div>
            <motion.div
              className="w-full  items-start text-left "
              initial={{ opacity: 0, x: 250, y: 50, scale: 3 }}
              animate={controls}
              transition={{ duration: 1 }}
            >
              <p className="text-lg md:text-3xl  md:mr-7 text-left text-slate-400 font-bold custom-strikethrough"
              style={{fontFamily: "Montserrat, sans-serif"}}
              >
                ${actualPrice}
              </p>
            </motion.div>
            <motion.div
              className="flex pl-2 md:pl-12"
              animate={controls2}
              transition={{ duration: 1 }}
              initial={{ x: -50, y: -50, opacity: 0 }}
            >
              <div>
                <p className="text-2xl md:text-4xl font-extrabold">
                  ${cost.toLocaleString("en-US")}
                </p>
                <p className="md:text-lg">Cost</p>
              </div>
              <p className="text-xs md:text-lg ml-2 flex mt-2 font-medium">/MONTH</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Range Input */}
      <div className="w-5/6 md:w-3/5">
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

      {/* Checkmark List */}
      <div className="w-5/6 md:w-3/6 flex flex-col items-center my-4">
        <div className="my-2 flex md:items-center ">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          <p>dummy text of the printing and typesetting</p>
        </div>
        <div className="my-2 flex md:items-center">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          dummy text of the printing and typesetting
        </div>
        <div className="my-2 flex md:items-center">
          <IoMdCheckmarkCircle className="h-8 w-8 text-green-600 mr-1" />
          dummy text of the printing and typesetting
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const [isSubscription, setIsSubscription] = useState(false);
  const [cost, setCost] = useState(7);  // Default cost, update as needed
  const [type, setType] = useState('PayAsYouGo');
  const [period, setPeriod] = useState(''); 

  const handleCostAndTypeChange = (newCost, newType, newPeriod) => {
    setCost(newCost);
    setType(newType);
    setPeriod(newPeriod);
  };
  console.log(cost,'costtttttt',type,'typeeeeee',period,'periodddddddddddd')

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
          style={
            {
              // backgroundColor: `${!isSubscription ? "rgb(204,204,204,0.3)" : ""}`,
            }
          }
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
          style={
            {
              // backgroundColor: `${isSubscription ? "rgb(204,204,204,0.3)" : ""}`,
            }
          }
        >
          SUBSCRIPTION
        </div>
      </div>
      <div
        className="w-full xl:w-5/6 max-w-5xl pt-5 pb-9 min-h-96 h-full rounded-2xl flex flex-col justify-center items-center text-sbg-slate-400 shadow-xl bg-bgblue"
        // style={{
        //   background: `linear-gradient(180deg, rgba(10,14,43,9.99) 0%, rgba(30,31,31,0.99) 100%)`,
        // }}
      >
        {isSubscription ? (
          <Subscription onCostAndTypeChange={handleCostAndTypeChange} />
        ) : (
          <PayAsYouGo onCostAndTypeChange={handleCostAndTypeChange} />
        )}
      </div>
    </div>
  );
}

export default Pricing;
