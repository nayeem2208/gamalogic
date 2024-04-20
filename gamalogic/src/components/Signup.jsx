import { GoogleLogin } from "@react-oauth/google";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { useUserState } from "../context/userContext";
import { FaEye } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";

function Signup() {
  let [data, setData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  let [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false,
  });
  let navigate = useNavigate();
  let { setUserDetails } = useUserState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const passwordVisibilityHandler = (field) => {
    setPasswordVisible((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?!\s).{6,}$/;
  var emailPattern = /\S+@\S+\.\S+/;
  let nameOfUser = data.fullname.trim();
  console.log(nameOfUser.length, "length");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await window.grecaptcha.getResponse();
    try {
      if (
        (data.fullname, data.email, data.password, data.confirmPassword) &&
        nameOfUser.length > 2
      ) {
        if (data.password == data.confirmPassword) {
          if (emailPattern.test(data.email)) {
            if (passwordPattern.test(data.password)) {
              let userData = await axiosInstance.post("signup", {
                data,
                token,
              });
              console.log(userData, "userdata");
              toast.dark(userData?.data);
              navigate("/VerifyYourEmail");
            } else {
              toast.error(
                "Please ensure your password contains at least 6 characters, including both letters and numbers.",
                4000
              );
            }
          } else {
            toast.error("Please enter a valid email address.");
          }
        } else {
          toast.error(
            "The password and confirm password do not match. Please ensure they are identical."
          );
        }
      } else {
        toast.error("Please provide all required information.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error);
    }
  };

  const authenticateData = async (credentialResponse) => {
    try {
      // let res = await axios.post('https://poseben-backend.onrender.com/api/GoogleLogin',{credentialResponse})
      let res = await axiosInstance.post("/googleSignup", {
        credentialResponse,
      });
      let token = res.data;
      setUserDetails(token);
      localStorage.setItem("token", JSON.stringify(token));
      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data.error);
    }
  };

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTA_SITE_KEY;
  console.log(recaptchaSiteKey, "recaptcha");
  function reCaptchaOnChange(value) {
    console.log("Captcha value:", value);
  }

  return (
    <div
      className="w-full flex justify-center items-center "
      style={{ marginTop: "40vw" }}
    >
      <div className="w-3/5 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Sign Up</h2>
          <p className="my-12 description">Create a free gamalogic account</p>
        </div>
        <div
          className="flex flex-col p-10 w-3/6 mb-16"
          style={{ backgroundColor: "#161736" }}
        >
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label htmlFor="">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={data.fullname}
              placeholder="Enter your name"
              onChange={handleInputChange}
              className="bg-transparent border border-cyan-400 rounded-md py-1 px-4 text-gray-400 my-1"
            />
            <label htmlFor="" className="mt-6">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              placeholder="Enter your email"
              onChange={handleInputChange}
              className="bg-transparent border border-cyan-400 rounded-md py-1 px-4 text-gray-400 my-1"
            />
            <label htmlFor="" className="mt-6">
              Password
            </label>
            <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-1 px-1  text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6 px-3 outline-none"
                type={passwordVisible.new ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                onChange={handleInputChange}
                value={data.password}
              />
              <button className="group relative inline-flex items-center justify-center  text-sm font-medium ">
                <IoInformationCircleOutline className="w-5 h-5 text-cyan-400 ml-2" />
                <div className="ease-in duration-300 opacity-0 group-hover:block group-hover:opacity-100 transition-all">
                  <div className="ease-in-out duration-500 -translate-y-4 pointer-events-none transition-all group-hover:-translate-y-16 absolute left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-sm text-center text-sm text-slate-300 before:-top-2">
                    <div className="rounded-sm bg-black py-1 px-2">
                      <p className="whitespace-nowrap">Please ensure your password <br /> contains at least 6 characters,<br /> including both letters and numbers. </p>
                    </div>
                    <div className="h-0 w-fit border-l-8 border-r-8 border-t-8 border-transparent border-t-black"></div>
                  </div>
                </div>
              </button>
              <FaEye
                className="w-4 h-4 text-cyan-400 ml-1"
                onClick={() => passwordVisibilityHandler("new")}
              />
            </div>
            <label htmlFor="" className="mt-6">
              Confirm Password
            </label>
            <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-1 px-1  text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6 px-3 outline-none"
                type={passwordVisible.confirm ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your password"
                onChange={handleInputChange}
                value={data.confirmPassword}
              />
              <FaEye
                className="w-4 h-4 text-cyan-400 ml-2"
                onClick={() => passwordVisibilityHandler("confirm")}
              />
            </div>
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={reCaptchaOnChange}
              className="my-2 flex justify-center"
            />
            <p className="text-xs text-center text-gray-400">
              By signing up, you agree to our{" "}
              <a
                href="https://gamalogic.com/terms-of-service"
                className="hover:text-white"
              >
                Terms of Service{" "}
              </a>
              ,
              <a
                href="https://gamalogic.com/privacy-policy"
                className="hover:text-white"
              >
                {" "}
                Privacy Policy and subscribe to our mailing list
              </a>
            </p>
            <div className="flex justify-center mt-8">
              <button
                className="bg-red-500 w-2/6 p-2 rounded-3xl"
                type="submit"
              >
                SIGN UP
              </button>
            </div>
          </form>
          <div className="flex justify-center my-5 ">
            {" "}
            {/* <div className="bg-white text-gray-700 p-3 w-3/5 h-16 rounded-lg shadow-md shadow-gray-200 flex justify-center items-center">
              Signup with Google
            </div> */}
            <GoogleLogin
              text="Sign up with Google"
              onSuccess={(credentialResponse) => {
                authenticateData(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
          <Link to="/signin">
            <div className="flex justify-center text-sm text-gray-300">
              Already have an account?
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
