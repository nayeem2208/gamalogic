import { useState } from "react";
import { CgFileDocument } from "react-icons/cg";
import { GrDocumentVerified ,GrMoney} from "react-icons/gr";
import {
  IoCloseSharp,
  IoLogOutOutline,
  IoMailOutline,
  IoReorderThree,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuFileUp, LuHistory, LuKey } from "react-icons/lu";
import { MdArrowDropDown, MdOutlineFindInPage } from "react-icons/md";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { RiProfileLine } from "react-icons/ri";
import { SlSupport } from "react-icons/sl";
import { Link, useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";


function Header() {
  let [dropDown, setDropDown] = useState(false);
  let [uploadfileDropDown, setUploadFileDropDown] = useState(false);
  let [tutorialDropDown, setTutorialDropDown] = useState(false);
  let { setUserDetails,setLinkedinLoading } = useUserState();
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
    setDropDown(false)
      localStorage.removeItem("Gamalogic_token");
      setUserDetails(null);
      navigate("/signin");
      window.reloadThriveWidget()
}
  return (
    <div className="  items-center text-white lg:hidden ">
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
            <Link to="/dashboard/quick-validation" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <GrDocumentVerified className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                Quick Validation
              </li>
            </Link>
            <Link to="/dashboard/email-finder" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <IoSearchOutline className="text-teal-800 mt-2 mx-2 text-lg" />
                Email Finder
              </li>
            </Link>
            <Link to="/dashboard/apikey" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <LuKey className="text-teal-800 mt-2 mx-2 text-lg" />
                API Key
              </li>
            </Link>
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
                <Link to="/dashboard/file-upload" onClick={dropDownToggle}>
                  <li className="py-2 flex ">
                    <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                    Email Verification
                  </li>
                </Link>
                <Link to="/dashboard/file-upload-finder" onClick={dropDownToggle}>
                  <li className="py-2 flex ">
                    <LuFileUp className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                    Email Finder
                  </li>
                </Link>
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
                <a href="https://docs.gamalogic.com/" target="_blank" onClick={dropDownToggle}>
                  <li className="py-2 flex ">
                    <IoMailOutline className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                    API Docs
                  </li>
                </a>
                <a
                  href="https://blog.gamalogic.com/email-validation-google-sheets-add-on/"
                  target="_blank"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex ">
                    <MdOutlineFindInPage className="text-teal-800 mt-2 mx-2 text-xl" />{" "}
                    Find Any Email
                  </li>
                </a>
                <a
                  href="https://blog.gamalogic.com/find-email-address-using-name-and-company-on-google-sheets-add-on/"
                  target="_blank"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex underlineLi">
                    <RiProfileLine className="text-teal-800 mt-2 mx-2 text-lg" />{" "}
                    Integrate Google sheets
                  </li>
                </a>
              </ul>
            )}
            <Link to='/dashboard/account-settings' onClick={dropDownToggle}>
            <li className="py-2 flex underlineLi">
              <IoSettingsOutline className="text-teal-800 mt-2 mx-2 text-lg" />
              Account Settings
            </li>
            </Link>
            <Link to='/dashboard/buy-credits' onClick={dropDownToggle}> 
            <li className="py-2 flex underlineLi">
              <PiCurrencyDollarSimpleBold className="text-teal-800 mt-2 mx-2 text-lg" />
              Buy Credits
            </li>
            </Link>
            <Link to="/dashboard/billing" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
              <LuHistory className="text-teal-800 mt-2 mx-2 text-lg" />
                Billing
              </li>
            </Link>
            <Link to="/dashboard/affiliate" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <GrMoney className="text-teal-800 mt-2 mx-2 text-lg" />
                Become an Affiliate
              </li>
            </Link>
            <Link to='/dashboard/support' onClick={dropDownToggle}>
            <li className="py-2 flex underlineLi">
              <SlSupport className="text-teal-800 mt-2 mx-2 text-lg" /> Support
            </li>
            </Link>
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
