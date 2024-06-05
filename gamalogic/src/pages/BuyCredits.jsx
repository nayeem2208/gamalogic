import { Link } from "react-router-dom";
import SubHeader from "../components/SubHeader";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useRef, useState } from "react";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";
import PaymentSuccess from "../components/PaymentSuccess";
import PaymentFailure from "../components/PaymentFailure";
import ServerError from "./ServerError";

function PayPalButton({ createOrder, onApprove, onError }) {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}

export default function BuyCredits() {
  const [success, setSuccess] = useState(false);
  const [failure, setFailure] = useState(false);
  const [orderID, setOrderID] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(2500);
  const [cost, setCost] = useState(10);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  let [serverError, setServerError] = useState(false);

  let { setCreditBal, creditBal,userDetails } = useUserState();
  const costRef = useRef(cost);
  const creditsRef = useRef(selectedCredits);

  useEffect(() => {
    costRef.current = cost;
    creditsRef.current = selectedCredits;
  }, [cost, selectedCredits]);
  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setIsLoaded(true);
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}`;
      script.onload = () => {
        setIsLoaded(true);
        setLoading(false);
      };
      script.onerror = () => {
        toast.error("Failed to load PayPal script");
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      const paypalScript = document.querySelector(`script[src="https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}"]`);
      if (paypalScript && document.body.contains(paypalScript)) {
        document.body.removeChild(paypalScript);
      }
    };
  }, []);

  useEffect(() => {
    if(APP=='beta'){
    document.title = "Buy Credits | Beta Dashboard";
    }
    else{
      document.title = "Buy Credits | Dashboard";

    }
  }, []);


  const creditCostMappings = [
    [2500, 10],
    [5000, 15],
    [10000, 20],
    [25000, 40],
    [50000, 70],
    [75000, 100],
    [100000, 120],
    [250000, 280],
    [500000, 480],
    [750000, 700],
    [1000000, 960],
    [2500000, 2200],
  ];

  const handleCreditsChange = (event) => {
    const value = event.target.value;
    event.target.style.setProperty('--value', (value / (creditCostMappings.length - 1)) * 100 + '%');
    const index = parseInt(event.target.value);
    const [credits, cost] = creditCostMappings[index];
    setSelectedCredits(credits);
    setCost(cost);
  };

  const createOrder = (data, actions) => {
    console.log(cost, "costttt is here");
    return actions.order
      .create({
        purchase_units: [
          {
            description: "Gamalogic Credits",
            amount: {
              currency_code: "USD",
              value: costRef.current,
            },
          },
        ],
      })
      .then((orderID) => {
        setOrderID(orderID);
        return orderID;
      });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async function () {
      try {
        await axiosInstance.post("/updateCredit", {
          credits: creditsRef.current,
          cost: costRef.current,
          data
        });
        setSuccess(true);
        setCreditBal(creditBal + creditsRef.current);
      } catch (error) {
        if (error.response && error.response.status === 500) {
          setServerError(true);
        } else {
          toast.error(error.response?.data?.error);
        }
      }
    });
  };
  const onError = async() => {
    toast.error("Error occured with our payment ");
    setFailure(true);
    await axiosInstance.post('/paymentFailedEmail',{cost})
  };

  useEffect(() => {
    if (success) {
      toast.success("Payment successful!!");
    }
  }, [success]);

  useEffect(() => {
    const rangeInput = document.querySelector('.custom-range');
    rangeInput.style.setProperty('--value', (rangeInput.value / (creditCostMappings.length - 1)) * 100 + '%');
  }, []);

  const handleTryAgain = () => {
    setFailure(false);
  };

  if (serverError) {
    return <ServerError />; 
  }

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  return (
    <div className=" px-6 md:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Buy Credits"} />
      {success == false && failure == false && (
        <div className="mt-6 sm:mt-14 text-bgblue subHeading">
          <h3>Pricing</h3>
          <p className="my-7 description">
            Choose the best pack that suits your needs from below. For custom
            quoting,
            <Link to='/dashboard/support' className="underline font-medium ml-1">
              contact us.
            </Link>
          </p>
          <div className="bg-gray-100 rounded h-52 md:h-96 shadow flex flex-col justify-center items-center">
            <div className="flex w-full text-center">
              <div className="w-3/6 border-r-4 border-gray-400">
                <p className="buyCreditsCost text-xl md:text-3xl font-medium">
                  {selectedCredits.toLocaleString()}
                </p>
                <p>Credits</p>
              </div>
              <div className="w-3/6">
                <p className="buyCreditsCost text-xl md:text-3xl font-medium">${cost.toLocaleString('en-US')}</p>
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
          {userDetails.confirm == 1 &&<div className=" flex justify-center mt-6">
          {isLoaded?<div className="w-4/6 sm:w-3/6 md:w-2/6  z-0">
              <PayPalButton
                createOrder={(data, actions) => createOrder(data, actions)}
                onApprove={onApprove}
                onError={onError}
              />
            </div>:<div className="text-center"><button className="bg-yellow-400 px-24 py-2 font-bold rounded  italic text-blue-900">Pay<span className="text-sky-600">Pal</span></button><p className="font-semibold text-sm">The safer,easier way to pay </p></div>}
          </div>}
        </div>
      )}
      {success == true && <PaymentSuccess data={{ cost, selectedCredits }} />}
      {failure == true && <PaymentFailure tryAgain={handleTryAgain} />}
    </div>
  );
}
