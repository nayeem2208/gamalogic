import { SiRazorpay } from "react-icons/si";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosInstance";
import { useUserState } from "../../context/userContext";
import {APP} from '../../axios/axiosInstance'
import { useEffect, useRef } from "react";

const RazorPaySubscriptionButton = ({  credits, onSuccess, onFailure }) => {
  const { userDetails,paymentDetails,setUserDetails } = useUserState();
  let paymentDetailsRef = useRef(paymentDetails);
  const taxRate = 0.18; // 18% tax

  useEffect(() => {
    paymentDetailsRef.current = paymentDetails;
  }, [paymentDetails]);


  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
    //   const totalAmount = cost + (cost * taxRate); // Calculate total amount including tax
      const result = await axiosInstance.post("/razorPaySubscription", {
        // amount: totalAmount, // Amount in paise (1 INR = 100 paise)
        paymentDetails: paymentDetailsRef.current,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      const keyofRazorPay = import.meta.env.VITE_RAZORPAY_KEY_ID;
    //   const { amount, id: order_id, currency } = result.data.order;
      const options = {
        key: keyofRazorPay,
        subscription_id: result.data.id,
        name: "Gamalogic",
        description: APP=='beta'?'Beta transaction':`${credits} credits on ${paymentDetails.type}`,
        image: "https://gamalogic.com/static/images/favicon.ico",
        // order_id,
        handler: async function (response) {
          const data = {
            // orderCreationId: order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySubscriptionId: response.razorpay_subscription_id,
            razorpaySignature: response.razorpay_signature,
            // cost: totalAmount,
            paymentDetails:paymentDetailsRef.current,
            credits
          };
          try {
            const result = await axiosInstance.post("/RazorPaySubscriptionPaymentSuccess", data);
          toast(result.data.msg);
          onSuccess();
          } catch (error) {
            console.log(error)
          }
          
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        notes: {
          address: "Gamalogic",
        },
        theme: {
          color: "#61dafb",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Server error:", error);
      // alert("Server error. Are you online?");
      // onFailure("serverError");
      const errorMessage = error.response?.data?.message;
      if (
        errorMessage === "Please fill all the required fields to buy credits"
      ) {
        const storedToken = localStorage.getItem("Gamalogic_token");
        if (storedToken) {
          let token;
          try {
            token = JSON.parse(storedToken);
          } catch (error) {
            token = storedToken;
          }
          token.accountDetailsModal = true;
          localStorage.setItem("Gamalogic_token", JSON.stringify(token));
          setUserDetails(token);
        }
      } else {
        alert("Server error. Are you online?");
        onFailure("serverError");
      }
    }
  };

  return (
    <button 
      onClick={displayRazorpay}
      className="bg-slate-100 flex justify-center items-center hover:bg-slate-300  shadow-lg rounded-lg px-24 py-2 font-bold mt-3 italic text-blue-950"
    >
     <SiRazorpay className="text-sky-600" />
     RazorPay 
    </button>
  );
};

export default RazorPaySubscriptionButton;
