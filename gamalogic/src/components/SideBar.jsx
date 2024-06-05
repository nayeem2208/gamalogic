import { GrDocumentVerified } from "react-icons/gr";
import {
  IoLogOutOutline,
  IoMailOutline,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuKey, LuFileUp } from "react-icons/lu";
import { CgFileDocument } from "react-icons/cg";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { SlSupport } from "react-icons/sl";
import { MdArrowDropDown, MdOutlineFindInPage } from "react-icons/md";
import { RiProfileLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";
import { startTransition } from 'react';

function SideBar() {
  let [uploadfileDropDown, setUploadFileDropDown] = useState(false);
  let [tutorialDropDown, setTutorialDropDown] = useState(false);
  let {setUserDetails,userDetails}=useUserState()
  let navigate = useNavigate();

  const location=useLocation()
  // console.log(location,'locationnnnn')

  useEffect(()=>{
    if(location.pathname=="/dashboard/file-upload"||"/dashboard/file-upload-finder"){
      setUploadFileDropDown(true)
    }
  })

  const uploadfileDropDownToggle = () => {
    setUploadFileDropDown(!uploadfileDropDown);
  };

  const tutorialDropDownToggle = () => {
    setTutorialDropDown(!tutorialDropDown);
  };

  function logoutHandler() {
    startTransition(() => {
    localStorage.removeItem("Gamalogic_token");
    setUserDetails(null);
    navigate("/signin");
  });
}


  return (
    <>
    {userDetails&&<div
      style={{ backgroundColor: "#0A0E2B",fontFamily: "Raleway, sans-serif" }}
      className="w-96 text-white hidden  lg:flex flex-col h-screen  p-4 pt-8 overflow-y-auto pb-12 "
    >
      <Link to="/">
        <p className="font-semibold text-xl text-center mt-2" style={{fontFamily: "Montserrat, sans-serif"}}>GAMALOGIC</p>
      </Link>
      <ul className="mt-14 text-lg font-semibold text-left">
        <Link to="/dashboard/quick-validation">
          <li className="my-4 flex ">
            <GrDocumentVerified className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
            Quick Validation
          </li>
        </Link>
        <Link to="/dashboard/email-finder">
            <li className="my-4 flex">
            <IoSearchOutline className="text-teal-800 mt-2 mx-2 text-lg" />
            Email Finder
          </li>
        </Link>
        <Link to="/dashboard/apikey">
          <li className="my-4 flex">
            <LuKey className="text-teal-800 mt-2 mx-2 text-lg" />
            API Key
          </li>
        </Link>

       <li className="my-4 flex cursor-pointer" onClick={uploadfileDropDownToggle}>
          <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Upload Your
          File
          <MdArrowDropDown className="mt-2 text-xl" />
        </li>
        {uploadfileDropDown && (
          <ul className="ml-6">
             <Link to='/dashboard/file-upload'><li className="my-4 flex">
              <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Email
              Verification
            </li></Link>
            <Link to='/dashboard/file-upload-finder'><li className="my-4 flex">
              <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Email
              Finder
            </li></Link>
          </ul>
        )}

        <li className="my-4 flex cursor-pointer" onClick={tutorialDropDownToggle}>
          <CgFileDocument className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
          Tutorial
          <MdArrowDropDown className="mt-2 text-xl" />
        </li>
        {tutorialDropDown && (
          <ul className="ml-6">
           {/* <Link to='/api-docs'> */}
           <a href="https://docs.gamalogic.com/" target="_blank" >
            <li className="my-4 flex">
              <IoMailOutline className="text-teal-800 mt-2 mx-2 text-lg" /> API
              Docs
            </li></a>
            {/* </Link>  */}
            {/* <Link to='/googleSheet-integration'> */}
            <a href="https://blog.gamalogic.com/email-validation-google-sheets-add-on/" target="_blank">
              <li className="my-4 flex">
              <RiProfileLine className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
              Integrate Google sheets
            </li></a>
            {/* </Link> */}
           {/* <Link to='/find-any-email'> */}
           <a href="https://blog.gamalogic.com/find-email-address-using-name-and-company-on-google-sheets-add-on/" target="_blank">
             <li className="my-4 flex">
              <MdOutlineFindInPage className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
              Find Any Email
            </li></a>
            {/* </Link> */}
            
          </ul>
        )}
        <Link to='/dashboard/account-settings'><li className="my-4 flex">
          <IoSettingsOutline className="text-teal-800 mt-2 mx-2 text-lg" />
          Account Settings
        </li></Link>
       <Link to='/dashboard/buy-credits'> <li className="my-4 flex">
          <PiCurrencyDollarSimpleBold className="text-teal-800 mt-2 mx-2 text-lg" />
          Buy Credits
        </li></Link>
        <Link to='/dashboard/support'><li className="my-4 flex">
          <SlSupport className="text-teal-800 mt-2 mx-2 text-lg" /> Support
        </li></Link>
        <li className="my-4 flex cursor-pointer" onClick={logoutHandler}>
          <IoLogOutOutline className="text-teal-800 mt-2 mx-2 " />
          Logout
        </li>
      </ul>
    </div>}
    </>
  );
}

export default SideBar;
