import { IoLogOutOutline } from "react-icons/io5";
import { useUserState } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; 
import { startTransition } from "react";

function SubHeader(props) {
  let { setUserDetails, userDetails,creditBal } = useUserState();
  let navigate = useNavigate();
    function logoutHandler() {
      startTransition(() => {
      localStorage.removeItem("Gamalogic_token");
      setUserDetails(null);
      navigate("/signin");
    });
    }
  return (
    <div className="flex justify-between mt-1 ">
      <p className="Underline ">{props.SubHeader}</p>
      <div className="flex " >
        <p className="bg-gray-100 rounded-lg px-4 flex items-center ">{creditBal} Credits Left</p> <p className="ml-6 mr-2 flex items-center ">{userDetails.name}</p>
        <button onClick={logoutHandler}><IoLogOutOutline className="  text-2xl" /></button>
      </div>
    </div>
  );
}

SubHeader.propTypes = {
  SubHeader: PropTypes.string.isRequired, // Validate SubHeader prop as a required string
};

export default SubHeader;
