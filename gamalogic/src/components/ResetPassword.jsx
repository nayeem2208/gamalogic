import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";

function ResetPassword() {
  let [resetPassword, setResetPassword] = useState({
    password: "",
    confirmPassword: "",
  });
  let [passwordVisible, setPasswordVisible] = useState(false);
  let [confirmpasswordVisible, setConfirmPasswordVisible] = useState(false);
  let location = useLocation();
  let navigate=useNavigate()
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const handleChange = (e) => {
    let { name, value } = e.target;
    setResetPassword((prevPassword) => ({
      ...prevPassword,
      [name]: value,
    }));
  };

  const passwordVisibleToggle = (field) => {
    if (field === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (field === "confirmPassword") {
      setConfirmPasswordVisible(!confirmpasswordVisible);
    }
  };
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?!\s).{6,}$/;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (resetPassword.password == resetPassword.confirmPassword) {
        if (passwordPattern.test(resetPassword.password)) {
          let reset = await axiosInstance.post("/resetPassword", {
            email: email,
            password: resetPassword.password,
          });
          console.log(reset,'reset')
          if(reset.status==200){
            toast.dark(reset.data?.message)
            navigate('/signin')
          }
        } else {
          toast.error(
            "Please provide a strong password,minimum 6 including character and number"
          );
        }
      } else {
        toast.error("Please check confirm password");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="w-full flex justify-center items-center "
      style={{ marginTop: "10vw" }}
    >
      <div className="w-3/5 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Reset you password</h2>
          <p className="my-12 description">
           Please add password to reset your password
          </p>
        </div>
        <div
          className="flex flex-col p-10 w-3/6 mb-16"
          style={{ backgroundColor: "#161736" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="">Password</label>
            <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-1 px-1  text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6 px-3 outline-none"
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                onChange={handleChange}
                value={resetPassword.password}
              />
              <FaEye
                className="w-4 h-4 text-cyan-400 ml-2"
                onClick={() => passwordVisibleToggle("password")}
              />
            </div>
            <label htmlFor="" className="mt-6">
              Confirm Password
            </label>
            <div className="flex bg-transparent border  justify-between items-center border-cyan-400 rounded-md py-1 px-1  text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6 px-3 outline-none"
                type={confirmpasswordVisible ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your password"
                onChange={handleChange}
                value={resetPassword.confirmPassword}
              />
              <FaEye
                className="w-4 h-4 text-cyan-400 ml-2"
                onClick={() => passwordVisibleToggle("confirmPassword")}
              />
            </div>
            <div className="flex justify-center mt-8">
              <button
                className="bg-red-500 w-2/6 p-2 rounded-3xl"
                type="submit"
              >
                SEND
              </button>
            </div>
          </form>
          <div className="flex justify-center text-sm text-gray-300 mt-2">
            <Link to="/signin">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
