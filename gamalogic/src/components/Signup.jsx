import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";
import { FaEye } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import ServerError from "../pages/ServerError";
import LinkedInPage from "./Linkedin";
import LinkedinLoading from "./LinkedinLoading";
import MicroSoftSignInButton from "./MicroSoftLogin";

function Signup() {
  let [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  let [passwordVisible, setPasswordVisible] = useState({
    new: false,
    confirm: false,
  });
  let [loading, setLoading] = useState(false);
  let [serverError, setServerError] = useState(false);
  const [thriveRefId, setThriveRefId] = useState(null);
  const [widgetCode, setWidgetCode] = useState(null);

  let navigate = useNavigate();
  let {
    setUserDetails,
    setCreditBal,
    setTutorialVideo,
    linkedinLoading,
    setLinkedinLoading,
  } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title =
        "Real time Catch all email validation API | Beta Gamalogic";
    } else {
      document.title = "Real time Catch all email validation API | Gamalogic";
    }
  }, []);

  useEffect(() => {
    let windowUrl = window.location.href;
    if (windowUrl.includes("code=") && !windowUrl.includes("widget_code=")) {
      setLinkedinLoading(true); // Set loading state to true

      (async () => {
        try {
          let codeMatch = windowUrl.match(/code=([a-zA-Z0-9_\-]+)/);
          if (codeMatch) {
            const code = codeMatch[1];
            const refData = JSON.parse(localStorage.getItem("refCode"));
            console.log(refData,'refData is hereeeeeeeeeeee')
            const res = await axiosInstance.post("/linkedinSignUp", {
              code,
              thriveRefId: refData?.refId || null,
              widgetCode: refData?.widget || null,
            });
            toast.success("Welcome back! You've successfully logged in");
            let token = res.data;
            setUserDetails(token);
            setCreditBal(token.credit);
            localStorage.setItem("Gamalogic_token", JSON.stringify(token));
            setTutorialVideo(true);
            navigate("/dashboard/quick-validation");
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

  useEffect(() => {
    let urlParams = new URLSearchParams(window.location.search);
    let refId = urlParams.get("thrive_ref_id");
    let widget = urlParams.get("widget_code");
    if (refId && widget) {
      setThriveRefId(refId);
      setWidgetCode(widget);

      // Save both values together as an object
      const refData = { refId, widget };
      localStorage.setItem("refCode", JSON.stringify(refData));
    }
  }, []);
  console.log(thriveRefId, "ref id is here ", widgetCode, "widget codeeeee");

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
  let firstname = data.firstname.trim();
  let lastname = data.lastname.trim();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        data.firstname &&
        data.lastname &&
        data.email &&
        data.password &&
        data.confirmPassword
      ) {
        if (firstname.length > 2) {
          if (lastname.length > 2) {
            if (data.password == data.confirmPassword) {
              if (emailPattern.test(data.email)) {
                if (passwordPattern.test(data.password)) {
                  setLinkedinLoading(true);
                  let userData = await axiosInstance.post("signup", {
                    data,
                    thriveRefId,
                    widgetCode,
                  });
                  setLinkedinLoading(false);
                  console.log(userData, "userdata");
                  toast.success(userData?.data);
                  navigate("/VerifyYourEmail", {
                    state: { email: data.email },
                  });
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
            toast.error("Last Name must be at least 3 characters long.");
          }
        } else {
          toast.error("First Name must be at least 3 characters long.");
        }
      } else {
        toast.error("Please provide all required information.");
      }
    } catch (error) {
      setLinkedinLoading(false);
      console.log(error);
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const authenticateData = async (credentialResponse) => {
    try {
      setLinkedinLoading(true);
      let res = await axiosInstance.post("/googleSignup", {
        credentialResponse,
        thriveRefId,
        widgetCode,
      });
      setLinkedinLoading(false);

      toast.success(
        "Welcome to Gamalogic! You've successfully registered with us."
      );
      let token = res.data;
      setUserDetails(token);
      setCreditBal(token.credit);
      localStorage.setItem("Gamalogic_token", JSON.stringify(token));
      setTutorialVideo(true);
      navigate("/dashboard/quick-validation");
    } catch (err) {
      setLinkedinLoading(false);
      if (err.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(err.response?.data?.error);
      }
    }
  };

  function reCaptchaOnChange(value) {
    console.log("Captcha value:", value);
  }

  if (serverError) {
    return <ServerError />;
  }

  return (
    <div className="w-full flex justify-center items-center  ">
      {linkedinLoading ? (
        <LinkedinLoading />
      ) : (
        <div className="w-5/6 sm:w-4/6 md:w-5/6 lg:w-4/6 flex flex-col justify-center items-center">
          <div className="text-center auth" style={{ position: "relative" }}>
            <div className="h2-background" style={{ position: "absolute" }}>
              <div className="red"></div>
              <div className="blue"></div>
            </div>
            <h2 className="font-semibold text-4xl">Sign Up</h2>
            <p className="my-12 description">Create a free Gamalogic account</p>
          </div>
          <div
            className="flex flex-col p-5 md:p-10  w-10/12 sm:w-5/6 md:w-3/6 lg:w-4/6 xl:w-3/6 mb-16"
            style={{ backgroundColor: "#161736" }}
          >
            <form
              className="flex flex-col text-xs sm:text-sm"
              onSubmit={handleSubmit}
            >
              <div className="xl:flex w-full">
                <div className="xl:mr-2">
                  <label htmlFor="">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    value={data.firstname}
                    placeholder="Enter your first name"
                    onChange={handleInputChange}
                    className="bg-transparent border border-cyan-400 rounded-md py-2 px-4 text-gray-400 my-1 w-full"
                  />
                </div>
                <div className="mt-6 xl:mt-0 xl:ml-2">
                  <label htmlFor="">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    value={data.lastname}
                    placeholder="Enter your last name"
                    onChange={handleInputChange}
                    className="bg-transparent border border-cyan-400 rounded-md py-2 px-4 text-gray-400 my-1 w-full"
                  />
                </div>
              </div>
              <label htmlFor="" className="mt-6">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={data.email}
                placeholder="Enter your email"
                onChange={handleInputChange}
                className="bg-transparent border border-cyan-400 rounded-md py-2 px-4 text-gray-400 my-1"
              />
              <label htmlFor="" className="mt-6">
                Password
              </label>
              <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-2 px-1  text-gray-400 my-1">
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
                        <p className="whitespace-nowrap">
                          Please ensure your password <br /> contains at least 6
                          characters,
                          <br /> including both letters and numbers.{" "}
                        </p>
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
              <div className="flex bg-transparent border justify-between items-center border-cyan-400 rounded-md py-2 px-1  text-gray-400 my-1">
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
              <p className="text-xs text-center text-gray-400">
                By signing up, you agree to our{" "}
                <a
                  href="https://gamalogic.com/terms-of-service"
                  className="hover:text-white"
                  target="_blank"
                >
                  Terms of Service
                </a>
                ,
                <a
                  href="https://gamalogic.com/privacy-policy"
                  className="hover:text-white"
                  target="_blank"
                >
                  {" "}
                  Privacy Policy and subscribe to our mailing list
                </a>
              </p>
              <div className="flex justify-center mt-8">
                <button
                  className="bg-red-500 w-2/6 p-2 rounded-3xl"
                  type="submit"
                  disabled={loading}
                >
                  SIGN UP
                </button>
              </div>
            </form>
            <div className="flex justify-center mt-5 ">
              {" "}
              <GoogleLogin
                style={{ maxWidth: "180px", width: "180px" }}
                text="Sign up with Google"
                onSuccess={(credentialResponse) => {
                  authenticateData(credentialResponse);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
            <div className="flex justify-center mt-2 ">
              <LinkedInPage endpoint={"signup"} />
            </div>
            <div className="flex justify-center my-2">
              <MicroSoftSignInButton
                page="signup"
                thriveRefId={thriveRefId}
                widgetCode={widgetCode}
              />
            </div>
            <Link to="/signin">
              <div className="flex justify-center text-xs md:text-sm text-gray-300 mt-4">
                Already have an account?
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
