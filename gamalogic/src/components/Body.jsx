import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserState } from "../context/userContext";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import AppTour from "./AppTour";

function Body() {
  let navigate = useNavigate();
  let {
    setUserDetails,
    userDetails,
    setCreditBal,
    creditBal,
    appTour,
    setAppTour,
  } = useUserState();

  const [showTourWithDelay, setShowTourWithDelay] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("Gamalogic_token");
    if (storedToken) {
      let parsedToken;
      try {
        parsedToken = JSON.parse(storedToken);
      } catch (error) {
        parsedToken = storedToken;
      }
      setUserDetails(parsedToken);
      setAppTour(parsedToken.AppTour);
      if (
        ((window.ztUserData &&
          (window.ztUserData["za_email_id"] === undefined ||
            window.ztUserData["za_email_id"] === null)) ||
          window.ztUserData["za_email_id"] == "") &&
        window.location.pathname.endsWith("EarnPoints")
      ) {
        window.reloadThriveWidget();
        console.log("inside body ztuser Dataaaaaaaaaaaaaaaaaaaaaaaa");
        window.ztUserData["za_email_id"] = parsedToken.email;
        window.ztUserData["user_unique_id"] = parsedToken.id;
        window.ztUserData["thrive_digest"] = parsedToken.HMACDigest;
        window.ztUserData["signUpPage"] = `${
          import.meta.env.VITE_FRONTEND_URL
        }/signup`;
        window.ztUserData["signInPage"] = `${
          import.meta.env.VITE_FRONTEND_URL
        }/signin`;

        if (!document.getElementById("thrive_script")) {
          // window.reloadThriveWidget();
          console.log("hereee");
          const thriveScript = document.createElement("script");
          thriveScript.id = "thrive_script";
          thriveScript.src =
            "https://thrive.zohopublic.com/thrive/publicpages/thrivewidget";
          document.body.appendChild(thriveScript);
          // window.reloadThriveWidget();
        }
      }
      if (window.location.pathname.endsWith("EarnPoints")) {
        // if (window.hideThriveWidget == true) {
        console.log("inside true settting when the page is in earn points");
        window.hideThriveWidget = false;
        window.reloadThriveWidget();
        // }
      } else {
        // if (window.hideThriveWidget == false) {
        console.log("inside false settting when the page is in earn points");

        window.hideThriveWidget = true;
        window.reloadThriveWidget();
        // }
      }
      // setTimeout(() => {
      //   setShowTourWithDelay(true);
      // }, 4000);
    } else {
      setUserDetails(null);
      navigate("/signin");
    }
  }, [navigate,setAppTour]);

  // console.log(
  //   window,
  //   window.google,
  //   "ddd",
  //   window.hideThriveWidget,
  //   "zt user data",
  //   navigate
  // );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/getCreditBalance");
        setCreditBal(response.data);
      } catch (error) {
        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data.error === "TokenExpired"
        ) {
          localStorage.removeItem("Gamalogic_token");
          setUserDetails(null);
          toast.error(error.response.data.message);
          navigate("/signin");
        }
        console.error("Error fetching credit balance:", error);
      }
    };

    fetchData();
  }, [creditBal]);

  return (
    <div className="w-full h-screen overflow-y-auto pb-12">
      {appTour?.showTour && <AppTour />}
      {userDetails && <Outlet />}
    </div>
  );
}

export default Body;
