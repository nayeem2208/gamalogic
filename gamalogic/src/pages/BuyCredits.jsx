import { Link } from "react-router-dom";
import SubHeader from "../components/SubHeader";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";

export default function BuyCredits() {
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [orderID, setOrderID] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(2500);
  const [cost, setCost] = useState(10);

  let { setUserDetails,setCreditBal,creditBal } = useUserState();
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

  const handleCreditsChange = (e) => {
    const index = parseInt(e.target.value);
    const [credits, cost] = creditCostMappings[index];
    setSelectedCredits(credits);
    setCost(cost);
  };
  console.log(cost,selectedCredits,'selected cost and credit ')
  const createOrder = (data, actions) => {
    console.log(cost,'costttt is here')
    return actions.order
      .create({
        purchase_units: [
          {
            description: "Gamalogic Credits",
            amount: {
              currency_code: "USD",
              value: cost,
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
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      try {
        const updateCreditFunction = async () => {
          let updateCredit = await axiosInstance.post("/updateCredit", {
            credits: selectedCredits,
          });
        };
        updateCreditFunction();
        setSuccess(true);
        setCreditBal(creditBal+selectedCredits)
      } catch (error) {
        console.log(error)
      }
    });
  };
  const onError = (data, actions) => {
    setErrorMessage("An Error occured with your payment ");
    toast('Error occured with our payment ')
  };

  useEffect(() => {
    if (success) {
      toast.success("Payment successful!!");
      console.log("Order successful . Your order id is--", orderID);
    }
  }, [success]);

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Buy Credits"} />
      <div className="mt-14 text-bgblue subHeading">
        <h3>Pricing</h3>
        <p className="my-7 description">
          Choose the best pack that suits your needs from below. For custom
          quoting,
          <Link to="/support" className="underline font-medium">
            {" "}
            contact us.
          </Link>
        </p>
        <div className="bg-gray-100 rounded h-96 shadow flex flex-col justify-center items-center">
          <div className="flex w-full text-center">
            <div className="w-3/6 border-r-4 border-gray-400">
              <p className="text-3xl font-semibold">{selectedCredits}</p>
              <p>Credits</p>
            </div>
            <div className="w-3/6">
              <p className="text-3xl font-semibold">${cost}</p>
              <p>Cost</p>
            </div>
          </div>
          <div className=" w-3/5 mt-12">
            <input
              type="range"
              className="w-full"
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
        <div className=" flex justify-center mt-6">
          <div className="w-2/6  z-0">
            <PayPalScriptProvider options={{ clientId: paypalClientId }}>
              <PayPalButtons
                style={{ layout: "horizontal" }}
                forceReRender={[cost]}
                createOrder={(data, actions) => createOrder(data, actions)}
                onApprove={onApprove}
                onError={onError}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
