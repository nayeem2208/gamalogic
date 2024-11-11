import React from "react";
import { useMsal } from "@azure/msal-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";
import axiosInstance from "../axios/axiosInstance";

const MicroSoftSignInButton = (props) => {
  const { instance } = useMsal();
  const { setUserDetails, setCreditBal, setTutorialVideo, setLinkedinLoading } =
    useUserState();
  const navigate = useNavigate();

  const request = {
    scopes: ["user.read"],
  };
  console.log(props.page, "page");
  const handleLogin = async () => {
    setLinkedinLoading(true);
    const token = await getToken();
    if (!token) {
      console.error("Failed to get access token");
      setLinkedinLoading(false);
      return;
    }

    try {
      const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Use response.data directly here
      const userDetails = response.data;
      if (props.page == "login") {
        try {
          const res = await axiosInstance.post("/microsoftLogin", userDetails);
          toast.success("Welcome to Gamalogic! You've successfully registered with us.");
          const token = res.data;
          setUserDetails(token);
          setCreditBal(token.credit);
          localStorage.setItem("Gamalogic_token", JSON.stringify(token));
          setTutorialVideo(true);
          navigate("/dashboard/quick-validation");
        } catch (error) {
          console.error(
            "Error sending user details to backend:",
            error.response
          );
          toast.error(error.response?.data?.error || "Error processing login");
        }
      } else if (props.page == "signup") {
        try {
          console.lof(props.teamId,'props.teamiddddddddddddddddddd')
          let res = await axiosInstance.post("/microsoftSignUP", {
            ...userDetails,
            thriveRefId: props.thriveRefId,
            widgetCode: props.widgetCode,
            teamId:props.teamId
          });
          toast.success("Welcome back! You've successfully logged in");
          let token = res.data;
          setUserDetails(token);
          setCreditBal(token.credit);
          localStorage.setItem("Gamalogic_token", JSON.stringify(token));
          setTutorialVideo(true);
          navigate("/dashboard/quick-validation");
        } catch (err) {
          console.error(err.response);
          toast.error(err.response?.data?.error || "Error processing login");
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    //   toast.error("Error fetching user details");
    } finally {
      setLinkedinLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      console.error("Silent token acquisition failed:", error);
      try {
        const response = await instance.acquireTokenPopup(request);
        return response.accessToken;
      } catch (popupError) {
        console.error("Popup token acquisition failed:", popupError);
        return null;
      }
    }
  };

  return (
    <button
    onClick={handleLogin}
    className="bg-white text-gray-600 flex text-xs font-semibold p-2 w-48 rounded-sm mt-2 justify-center items-center"
    style={{ maxWidth: "180px",width:'180px' }}
  >
    <img
      src="http://orig05.deviantart.net/e2b8/f/2012/035/f/7/windows_8_square_logo_by_darkmaster79-d4on7uq.png"
      alt="Microsoft Logo"
      className="w-5 h-5 mr-1"
    />
    Sign in with Microsoft
  </button>
  );
};

export default MicroSoftSignInButton;
