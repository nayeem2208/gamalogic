import { useState } from "react";
import { CgFileDocument } from "react-icons/cg";
import { GrDocumentVerified } from "react-icons/gr";
import {
  IoCloseSharp,
  IoLogOutOutline,
  IoMailOutline,
  IoReorderThree,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuFileUp, LuKey } from "react-icons/lu";
import { MdArrowDropDown, MdOutlineFindInPage } from "react-icons/md";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { RiProfileLine } from "react-icons/ri";
import { SlSupport } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";

function Header() {
  let [dropDown, setDropDown] = useState(false);
  let [uploadfileDropDown, setUploadFileDropDown] = useState(false);
  let [tutorialDropDown, setTutorialDropDown] = useState(false);
  let { setUserDetails, userDetails } = useUserState();
  let navigate = useNavigate();

  const dropDownToggle = () => {
    setDropDown(!dropDown);
  };

  const uploadfileDropDownToggle = () => {
    setUploadFileDropDown(!uploadfileDropDown);
  };

  const tutorialDropDownToggle = () => {
    setTutorialDropDown(!tutorialDropDown);
  };

  function logoutHandler() {
    localStorage.removeItem("token");
    setUserDetails(null);
    navigate("/signin");
  }
  return (
    <div className="  items-center text-white lg:hidden">
      <div
        className=" px-6 py-4 flex justify-between underlineLi"
        style={{ backgroundColor: "#0A0E2B" }}
      >
        {" "}
        <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        <div>
          {dropDown ? (
            <IoCloseSharp onClick={dropDownToggle} className="text-3xl" />
          ) : (
            <IoReorderThree className="text-3xl" onClick={dropDownToggle} />
          )}
        </div>
      </div>
      {dropDown && (
        <div
          className="pb-10"
          style={{ backgroundColor: "rgba(10, 14, 43,0.97)" }}
        >
          <ul className="mb-14 text-lg font-semibold text-left px-8">
            <li className="py-2 flex underlineLi">
              <GrDocumentVerified className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
              Quick Validation
            </li>

            <li className="py-2 flex underlineLi">
              <IoSearchOutline className="text-teal-800 mt-2 mx-2 text-lg" />
              Email Finder
            </li>
            <li className="py-2 flex underlineLi">
              <LuKey className="text-teal-800 mt-2 mx-2 text-lg" />
              API Key
            </li>
            <li
              className="py-2 flex underlineLi"
              onClick={uploadfileDropDownToggle}
            >
              <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Upload
              Your File
              <MdArrowDropDown className="mt-2 text-xl" />
            </li>
            {uploadfileDropDown && (
              <ul className="ml-6 ">
                <li className="py-2 flex ">
                  <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Email
                  Verification
                </li>
                <li className="py-2 flex ">
                  <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" /> Email
                  Finder
                </li>
              </ul>
            )}

            <li
              className="py-2 flex underlineLi"
              onClick={tutorialDropDownToggle}
            >
              <CgFileDocument className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
              Tutorial
              <MdArrowDropDown className="mt-2 text-xl" />
            </li>
            {tutorialDropDown && (
              <ul className="ml-6">
                <li className="py-2 flex ">
                  <IoMailOutline className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                  API Docs
                </li>
                <li className="py-2 flex ">
                  <MdOutlineFindInPage className="text-teal-800 mt-2 mx-2 text-xl" />{" "}
                  Find Any Email
                </li>
                <li className="py-2 flex underlineLi">
                  <RiProfileLine className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                  Integrate Google sheets
                </li>
              </ul>
            )}
            <li className="py-2 flex underlineLi">
              <IoSettingsOutline className="text-teal-800 mt-2 mx-2 text-lg" />
              Account Settings
            </li>
            <li className="py-2 flex underlineLi">
              <PiCurrencyDollarSimpleBold className="text-teal-800 mt-2 mx-2 text-lg" />
              Buy Credits
            </li>
            <li className="py-2 flex underlineLi">
              <SlSupport className="text-teal-800 mt-2 mx-2 text-lg" /> Support
            </li>
            <li className="py-2 flex underlineLi" onClick={logoutHandler}>
              <IoLogOutOutline className="text-teal-800 mt-2 mx-2 " />
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Header;
