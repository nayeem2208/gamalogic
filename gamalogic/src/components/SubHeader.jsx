import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useUserState } from "../context/userContext";
import { useNavigate } from "react-router-dom";

function SubHeader(props) {
  let { setUserDetails, userDetails,creditBal } = useUserState();
  let navigate = useNavigate();
    function logoutHandler() {
      localStorage.removeItem("token");
      setUserDetails(null);
      navigate("/signin");
    }
  return (
    <div className="flex justify-between mt-1 ">
      <p className="  orangeUnderline">{props.SubHeader}</p>
      <div className="flex " >
        <p className="bg-gray-100 rounded-lg px-4 flex items-center ">{creditBal} Credits Left</p> <p className="ml-6 mr-2 flex items-center ">{userDetails.name}</p>
        <button onClick={logoutHandler}><IoLogOutOutline className="  text-2xl" /></button>
      </div>
    </div>
  );
}

export default SubHeader;
