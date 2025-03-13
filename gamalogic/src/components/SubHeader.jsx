import { IoLogOutOutline } from "react-icons/io5";
import { useUserState } from "../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { SlInfo } from "react-icons/sl";
import axiosInstance from "../axios/axiosInstance";
import ServerError from "../pages/ServerError";
import { IoIosNotifications } from "react-icons/io";
import Notification from "./notification/Notifications";
// import "../css/notification.css";
import Badge from "@mui/material/Badge";

function SubHeader(props) {
  let {
    setUserDetails,
    userDetails,
    creditBal,
    setLinkedinLoading,
    notification,
    setNotification,
    newNotification,
    setNewNotification,
  } = useUserState();

  let [serverError, setServerError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  let navigate = useNavigate();

  // const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);

  const toggleNotifications = () => {
    setShowNotifications((prevState) => !prevState);
    setNewNotification(0);
  };

  // const handleClickOutside = (event) => {
  //   if (
  //     notificationRef.current &&
  //     !notificationRef.current.contains(event.target)
  //   ) {
  //     setShowNotifications(false);
  //   }
  // };
  // useEffect(() => {
  //   if (showNotifications) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [showNotifications]);
  // const toggleNotifications = () => {
  //   setShowNotifications(!showNotifications);
  // };

  function logoutHandler() {
    setLinkedinLoading(true);
    localStorage.removeItem("Gamalogic_token");
    setUserDetails(null);
    navigate("/signin");
    setLinkedinLoading(false);
    window.reloadThriveWidget();
  }
  const HandleSendVerifyLink = async (e) => {
    try {
      e.preventDefault();
      await axiosInstance.get(`/SendVerifyEmail?email=${userDetails.email}`);
      toast.success("New verification link sent successfully");
    } catch (error) {
      console.log(error);
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
    <div>
      <div className="hidden sm:flex  justify-between mt-1 ">
        <p className="orangeUnderline ">{props.SubHeader}</p>
        <div className="flex justify-end subHeaderCredits mt-6 md:mt-0">
          <p
            className="bg-gray-100 hidden  rounded-lg px-4 lg:flex items-center mr-2 cursor-pointer"
            onClick={toggleNotifications}
          >
            Notifications{" "}
            <Badge badgeContent={newNotification} color="error">
              <IoIosNotifications className="w-6 h-6 text-gray-500" />
            </Badge>{" "}
          </p>
          {showNotifications && (
            <div ref={notificationRef}>
              <Notification
                notifications={notification}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
          <p className="bg-gray-100 rounded-lg px-4 flex items-center ">
            {creditBal.toLocaleString("en-US")} Credits Left
          </p>{" "}
          <p className="ml-6 mr-2 flex items-center ">{userDetails.name}</p>
          <button onClick={logoutHandler}>
            <IoLogOutOutline className="  text-2xl" />
          </button>
        </div>
      </div>
      <div className="sm:hidden justify-between mt-1 ">
        <div className="flex flex-wrap justify-center subHeaderCredits mb-4 md:mt-0">
          {/* <p className="bg-gray-100 rounded-lg px-2 flex items-center mr-2">
           <IoIosNotifications className="w-4 h-4 text-red-500"/>
          </p> */}
          <p className="bg-gray-100 rounded-lg px-4 flex items-center mt-3">
            {creditBal.toLocaleString("en-US")} Credits Left
          </p>{" "}
          <p className="ml-6 mr-2 flex items-center mt-3">{userDetails.name}</p>
          <button onClick={logoutHandler}>
            <IoLogOutOutline className="  text-2xl mt-3" />
          </button>
        </div>
        <p className="orangeUnderline text-center">{props.SubHeader}</p>
      </div>
      {userDetails.confirm == 0 && (
        <div className="my-4 flex bg-red-100 border border-red-400 rounded-lg p-2 text-sm 2xl:text-base">
          <SlInfo className="text-red-500 mx-1 mt-1" />
          <p>
            Your account is not verified! To begin using our services please
            click the link that was sent to you by email.
            <button
              className="text-bgblue font-semibold ml-1"
              onClick={HandleSendVerifyLink}
            >
              Resend Verification Email
            </button>
          </p>
        </div>
      )}
      {userDetails.expired?.status == true &&
        userDetails.expired?.reason == "date" &&
        userDetails.isTeamMember != 1 && (
          <div className="my-8 flex bg-red-100 border border-red-400 rounded-lg p-2 text-sm 2xl:text-base">
            <SlInfo className="text-red-500 mx-1 mt-1" />
            <p>
              Your free trial has expired! To continue using our services,
              please purchase additional credits.
              <Link to="/dashboard/buy-credits">
                <button className="text-bgblue font-semibold ml-1">
                  Buy Credits
                </button>
              </Link>
            </p>
          </div>
        )}

      {userDetails.expired?.status == true &&
        userDetails.expired?.reason == "credit" &&
        userDetails.isTeamMember != 1 && (
          <div className="my-8 flex bg-red-100 border border-red-400 rounded-lg p-2 text-sm 2xl:text-base">
            <SlInfo className="text-red-500 mx-1 mt-1" />
            <p>
              You have used all your free credits! To continue using our
              services, please purchase additional credits.
              <Link to="/dashboard/buy-credits">
                <button className="text-bgblue font-semibold ml-1">
                  Buy Credits
                </button>
              </Link>
            </p>
          </div>
        )}
      {userDetails.isTeamid && (
        <div className="my-8 flex bg-gray-100 border border-gray-400 rounded-lg p-2 text-sm 2xl:text-base">
          <p className="text-sm text-gray-500">
            You are part of the team managed by the admin:{" "}
            {userDetails.isTeamid}
          </p>
        </div>
      )}
    </div>
  );
}

export default SubHeader;
