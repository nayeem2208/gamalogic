import { IoLogOutOutline } from "react-icons/io5";
import { useUserState } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { startTransition, useState } from "react";
import { SlInfo } from "react-icons/sl";
import axiosInstance from "../axios/axiosInstance";
import ServerError from "../pages/ServerError";

function SubHeader(props) {
  let { setUserDetails, userDetails, creditBal } = useUserState();
  let [serverError, setServerError] = useState(false);
  let navigate = useNavigate();
  function logoutHandler() {
    startTransition(() => {
      localStorage.removeItem("Gamalogic_token");
      setUserDetails(null);
      navigate("/signin");
    });
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
      <div className="sm:flex justify-between mt-1 ">
        <p className="orangeUnderline ">{props.SubHeader}</p>
        <div className="flex justify-end subHeaderCredits mt-6 md:mt-0">
          <p className="bg-gray-100 rounded-lg px-4 flex items-center ">
          {creditBal.toLocaleString('en-US')} Credits Left
          </p>{" "}
          <p className="ml-6 mr-2 flex items-center ">{userDetails.name}</p>
          <button onClick={logoutHandler}>
            <IoLogOutOutline className="  text-2xl" />
          </button>
        </div>
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
    </div>
  );
}

SubHeader.propTypes = {
  SubHeader: PropTypes.string.isRequired, // Validate SubHeader prop as a required string
};

export default SubHeader;
