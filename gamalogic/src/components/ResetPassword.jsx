import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import ServerError from "../pages/ServerError";

function ResetPassword() {
  let [resetPassword, setResetPassword] = useState({
    password: "",
    confirmPassword: "",
  });
  let [passwordVisible, setPasswordVisible] = useState(false);
  let [confirmpasswordVisible, setConfirmPasswordVisible] = useState(false);
  let [serverError, setServerError] = useState(false);
  let location = useLocation();
  let navigate=useNavigate()
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Reset Password | Beta Gamalogic";
    } else {
      document.title = "Reset Password | Gamalogic";
    }
  }, []);

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
          if(reset.status==200){
            toast.success(reset.data?.message)
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
      if (error.response.status === 500) {
        setServerError(true); 
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };

  if (serverError) {
    return <ServerError />; 
  }

  return (
    <div
      className="w-full flex justify-center items-center "
    >
      <div className="w-5/6 sm:w-4/6 md:w-5/6 lg:w-4/6 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Set New Password</h2>
          <p className="my-12 description">
          Give a new password and confirm
          </p>
        </div>
        <div
          className="flex flex-col p-10 px-5 w-10/12 sm:w-5/6 md:w-3/6 lg:w-4/6 xl:w-3/6  mb-16"
          style={{ backgroundColor: "#161736" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col text-xs sm:text-sm">
            <label htmlFor="">Password</label>
            <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-2 px-1  text-gray-400 my-1">
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
            <div className="flex bg-transparent border  justify-between items-center border-cyan-400 rounded-md py-2 px-1  text-gray-400 my-1">
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
