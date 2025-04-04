import { SiRazorpay } from "react-icons/si";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosInstance";
import { useUserState } from "../../context/userContext";
import { APP } from "../../axios/axiosInstance";

const RazorpayButton = ({ cost, credits, onSuccess, onFailure }) => {
  const { userDetails, paymentDetails, setUserDetails } = useUserState();
  const taxRate = 0.18;

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
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const totalAmount = cost + cost * taxRate;
      const result = await axiosInstance.post("/Razorpay", {
        amount: totalAmount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const keyofRazorPay = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const { amount, id, currency } = result.data.order;
      let order_id = id;
      const options = {
        key: keyofRazorPay,
        amount: amount.toString(),
        currency,
        name: "Gamalogic",
        description:
          APP == "beta"
            ? "Beta transaction"
            : `${credits} credits on ${paymentDetails.type}`,
        image: "https://gamalogic.com/static/images/favicon.ico",
        order_id,
        handler: async function (response) {
          const data = {
            orderCreationId: id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            cost: totalAmount,
            credits,
          };

          const result = await axiosInstance.post(
            "/RazorPayPaymentSuccess",
            data
          );
          toast(result.data.msg);
          onSuccess();
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

      const errorMessage = error.response?.data?.message;
      console.log(errorMessage, "error message");
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
      className="bg-slate-100 hover:bg-slate-300 flex shadow-lg rounded-lg px-24 py-2 font-bold mt-3 italic text-blue-950"
    >
      <SiRazorpay className="text-sky-600" />
      RazorPay
    </button>
  );
};

export default RazorpayButton;
