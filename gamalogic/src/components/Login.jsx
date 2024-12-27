import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { useUserState } from "../context/userContext";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import ServerError from "../pages/ServerError";
import LinkedInPage from "./Linkedin";
import LinkedinLoading from "./LinkedinLoading";
import MicroSoftSignInButton from "./MicroSoftLogin";
import AppTour from "./AppTour";

function Login() {
  let [data, setData] = useState({ email: "", password: "" });
  let {
    setUserDetails,
    setCreditBal,
    setTutorialVideo,
    linkedinLoading,
    setLinkedinLoading,
    setAppTour,
  } = useUserState();
  let [passwordVisible, setPasswordVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [serverError, setServerError] = useState(false);
  // let [linkedinLoading, setLinkedinLoading] = useState(false);

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
    if (APP == "beta") {
      document.title = "Real time Catch all email validation | Beta Gamalogic";
    } else {
      document.title = "Real time Catch all email validation | Gamalogic";
    }
    if (
      window.ztUserData &&
      window.ztUserData["za_email_id"] &&
      window.ztUserData["za_email_id"] != ""
    ) {
      window.ztUserData["za_email_id"] = "";
      window.ztUserData["user_unique_id"] = "";
      window.ztUserData["thrive_digest"] = "";
      window.ztUserData["signUpPage"] = `${
        import.meta.env.VITE_FRONTEND_URL
      }/signup`;
      window.ztUserData["signInPage"] = `${
        import.meta.env.VITE_FRONTEND_URL
      }/signin`;

      // const thriveScript = document.createElement("script");
      // thriveScript.id = "thrive_script";
      // thriveScript.src = "";
      // document.body.appendChild(thriveScript);
      // console.log(window.ztUserData,thriveScript ,"inside the ztuserdata loginnnnnnnnnnnnnnnnnnnnn");
      window.hideThriveWidget = true;
      window.reloadThriveWidget();
    }
  }, []);

  useEffect(() => {
    let windowUrl = window.location.href;
    if (windowUrl.includes("code=")) {
      setLinkedinLoading(true); // Set loading state to true

      (async () => {
        try {
          let codeMatch = windowUrl.match(/code=([a-zA-Z0-9_\-]+)/);
          if (codeMatch) {
            const code = codeMatch[1];
            const res = await axiosInstance.post("/linkedinSignIn", {
              code,
            });
            toast.success("Welcome back! You've successfully logged in");
            let token = res.data;
            setUserDetails(token);
            setCreditBal(token.credit);
            localStorage.setItem("Gamalogic_token", JSON.stringify(token));
            setTutorialVideo(true);
            navigate("/dashboard/userDashboard");
          }
        } catch (err) {
          console.error(err);
          if (err.response.status === 500) {
            setServerError(true);
          } else {
            toast.error(err.response?.data?.error);
          }
        } finally {
          setLinkedinLoading(false);
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState(null, "", newUrl);
        }
      })();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setLinkedinLoading(true);
      let userData = await axiosInstance.post("login", data);
      setLinkedinLoading(false);
      if (userData.data?.error == "Blocked") {
        navigate("/blocked");
      } else {
        toast.success("Welcome back! You've successfully logged in.");
        let token = userData.data;
        setUserDetails(token);
        setCreditBal(token.credit);
        setAppTour(token.AppTour || null);
        localStorage.setItem("Gamalogic_token", JSON.stringify(token));
        setTutorialVideo(true);
        navigate("/dashboard/userDashboard");
      }
    } catch (error) {
      setLinkedinLoading(false);
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const authenticateData = async (credentialResponse) => {
    try {
      setLinkedinLoading(true);
      // let res = await axios.post('https://poseben-backend.onrender.com/api/GoogleLogin',{credentialResponse})
      let res = await axiosInstance.post("/googleLogin", {
        credentialResponse,
      });
      setLinkedinLoading(false);
      toast.success("Welcome back! You've successfully logged in");
      let token = res.data;
      setUserDetails(token);
      setCreditBal(token.credit);
      setAppTour(token.AppTour || null);
      localStorage.setItem("Gamalogic_token", JSON.stringify(token));
      setTutorialVideo(true);
      navigate("/dashboard/userDashboard");
    } catch (err) {
      setLinkedinLoading(false);
      if (err.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(err.response?.data.error);
      }
    }
  };

  const passwordVisibleToggle = () => {
    if (data.password) {
      setPasswordVisible(!passwordVisible);
    }
  };

  if (serverError) {
    return <ServerError />;
  }

  if (linkedinLoading) {
    return <LinkedinLoading />;
  }

  return (
    <div
      className="w-full flex justify-center items-center "
      // style={{ marginTop: "20vw" }}
    >
      {linkedinLoading ? (
        <LinkedinLoading />
      ) : (
        <div className="w-5/6 sm:w-4/6 md:w-5/6 lg:w-4/6  px-2 flex flex-col justify-center items-center">
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
            className="flex flex-col p-10 px-5 md:px-10 w-full sm:w-5/6 md:w-3/6 lg:w-4/6 xl:w-3/6 mb-16"
            style={{ backgroundColor: "#161736" }}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col text-xs sm:text-sm px-1"
            >
              <label htmlFor="">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                onChange={handleInputChange}
                value={data.email}
                className="bg-transparent border border-cyan-400 rounded-md py-2 px-4 text-gray-400 my-1"
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
              <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-2 px-1  text-gray-400 my-1">
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
                  disabled={loading}
                >
                  SIGN IN
                </button>
              </div>
            </form>
            <div className="flex justify-center mt-5 ">
              {" "}
              {/* <div className="bg-white text-gray-700 p-3 w-3/5 h-16 rounded-lg shadow-md shadow-gray-200 flex justify-center items-center">
              <button onClick={() => login()}>Signin with Google</button>
            </div> */}
              <GoogleLogin
                style={{ maxWidth: "180px", width: "180px" }}
                onSuccess={(credentialResponse) => {
                  authenticateData(credentialResponse);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
            {/* <div className="flex justify-center mt-2 w-full">
              <LinkedInPage endpoint={"signin"} />
            </div> */}
            <div className="flex justify-center my-2">
              <MicroSoftSignInButton page="login" />
            </div>
            <div className="flex justify-center text-xs md:text-sm text-gray-300 mt-3">
              <Link to="/signup">
                <div className="border-r border-cyan-400 mx-2 px-2">
                  Need an account?
                </div>
              </Link>
              <Link to="/resetpassword">
                <div className="mx-2">Forgot Password?</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
