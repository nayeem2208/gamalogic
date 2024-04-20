import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axiosInstance from "../axios/axiosInstance";
import { useUserState } from "../context/userContext";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";

function Login() {
  let [data, setData] = useState({ email: "", password: "" });
  let { setUserDetails ,setCreditBal} = useUserState();
  let [passwordVisible, setPasswordVisible] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    async function verifyEmail() {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams) {
        const email = queryParams.get("email");
        if (email) {
          let res = await axiosInstance.get(`/verifyEmail?email=${email}`);
          let token = res.data;
          setUserDetails(token);
          localStorage.setItem("token", JSON.stringify(token));
          navigate("/");
        }
      }
    }
    verifyEmail();
  }, [location.search]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userData = await axiosInstance.post("login", data);
      toast.dark("Authentication success", 2000);
      let token = userData.data;
      setUserDetails(token);
      localStorage.setItem("token", JSON.stringify(token));
      navigate("/");
    } catch (error) {
      console.log(error.response, "error");
      toast.error(error.response.data.error);
    }
  };

  // const login = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //        authenticateData(tokenResponse);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error(err.response?.data.error);
  //     }
  //   }
  // });

  const authenticateData = async (credentialResponse) => {
    try {
      // let res = await axios.post('https://poseben-backend.onrender.com/api/GoogleLogin',{credentialResponse})
      let res = await axiosInstance.post("/googleLogin", {
        credentialResponse,
      });
      let token = res.data;
      setUserDetails(token);
      setCreditBal(token.credit)
      localStorage.setItem("token", JSON.stringify(token));
      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data.error);
    }
  };

  const passwordVisibleToggle = () => {
    if (data.password) {
      setPasswordVisible(!passwordVisible);
    }
  };

  return (
    <div
      className="w-full flex justify-center items-center "
      style={{ marginTop: "36vw" }}
    >
      <div className="w-3/5 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Sign in</h2>
          <p className="my-12 description">
            Please sign in using your email and password
          </p>
        </div>
        <div
          className="flex flex-col p-10 w-3/6 mb-16"
          style={{ backgroundColor: "#161736" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              onChange={handleInputChange}
              value={data.email}
              className="bg-transparent border border-cyan-400 rounded-md py-1 px-4 text-gray-400 my-1"
            />
            <label htmlFor="" className="mt-6">
              Password
            </label>
            {/* <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              onChange={handleInputChange}
              value={data.password}
              className="bg-transparent border border-cyan-400 rounded-md py-1 px-4 text-gray-400 my-1"
            /> */}
            <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-1 px-1  text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6 px-3 outline-none"
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                onChange={handleInputChange}
                value={data.password}
              />
              <FaEye
                className="w-4 h-4 text-cyan-400 ml-2"
                onClick={passwordVisibleToggle}
              />
            </div>
            <div className="flex justify-center mt-8">
              <button
                className="bg-red-500 w-2/6 p-2 rounded-3xl"
                type="submit"
              >
                SIGN IN
              </button>
            </div>
          </form>
          <div className="flex justify-center my-5 ">
            {" "}
            {/* <div className="bg-white text-gray-700 p-3 w-3/5 h-16 rounded-lg shadow-md shadow-gray-200 flex justify-center items-center">
              <button onClick={() => login()}>Signin with Google</button>
            </div> */}
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                authenticateData(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
          <div className="flex justify-center text-sm text-gray-300">
            <Link to="/signup">
              <div className="border-r border-cyan-400 mx-2 px-2">
                Need an account?
              </div>
            </Link>
            <Link to="/forgotPassword">
              <div className="mx-2">Forgot Password?</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
