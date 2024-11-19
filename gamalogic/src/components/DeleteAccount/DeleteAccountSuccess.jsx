import { useEffect } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useUserState } from "../../context/userContext";

function DeleteAccountSuccess() {
  let { setUserDetails} = useUserState();

  useEffect(()=>{
    localStorage.removeItem("Gamalogic_token");
    setUserDetails(null);
  },[])

  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center">
       <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center text-white">GAMALOGIC</p>
        </Link>
      </div>
      <div className="w-3/5 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl md:text-6xl text-red-500">Account Deleted</h2>
          <p className="mt-12 description">
            Your account has been successfully deleted. We're sad to see you go!
          </p>
          <div className="flex justify-center">
            <IoWarningOutline style={{ fontSize: '15vw' }} className="text-red-500" />
          </div>
          <div className="verify-foot-p description">
            <p>If you deleted your account by mistake or have any concerns, please contact our support team for assistance.</p>
            <p>You can reach us at <a className="text-white" href="mailto:support@gamalogic.com">support@gamalogic.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountSuccess;
