import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserState } from "../context/userContext";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";

function Body() {
  let navigate = useNavigate();
  let { setUserDetails, userDetails, setCreditBal, creditBal } = useUserState();

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
      // console.log(window.ztUserData,parsedToken.HMACDigest,'zt user data')
      if (
        window.ztUserData &&
        (window.ztUserData["za_email_id"] === undefined ||
          window.ztUserData["za_email_id"] === null)
      ) {
        window.ztUserData["za_email_id"] = parsedToken.email;
        window.ztUserData["user_unique_id"] = parsedToken.id;
        window.ztUserData["thrive_digest"] = parsedToken.HMACDigest;
        window.ztUserData["signUpPage"] = `${
          import.meta.env.VITE_FRONTEND_URL
        }/signup`;
        window.ztUserData["signInPage"] = `${
          import.meta.env.VITE_FRONTEND_URL
        }/signin`;

        const thriveScript = document.createElement("script");
        thriveScript.id = "thrive_script";
        thriveScript.src =
          "https://thrive.zohopublic.com/thrive/publicpages/thrivewidget";
        document.body.appendChild(thriveScript);
        console.log(window.ztUserData, "inside the ztuserdata");
      }
      if (window.location.pathname.endsWith("affiliate")) {
        if (window.hideThriveWidget == true) {
          window.hideThriveWidget = false;
          window.reloadThriveWidget();
        }
      } else {
        if (window.hideThriveWidget == false) {
          window.hideThriveWidget = true;
          window.reloadThriveWidget();
        }
      }
    } else {
      setUserDetails(null);
      navigate("/signin");
    }
  }, [navigate]);

  // console.log(window.ztUserData,'zt user data',navigate)

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
      {userDetails && <Outlet />}
    </div>
  );
}

export default Body;
