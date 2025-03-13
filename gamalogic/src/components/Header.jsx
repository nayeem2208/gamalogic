import { useState } from "react";
import { CgFileDocument } from "react-icons/cg";
import { GrDocumentVerified, GrMoney } from "react-icons/gr";
import {
  IoCloseSharp,
  IoLogOutOutline,
  IoMailOutline,
  IoReorderThree,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuFileUp, LuHistory, LuKey } from "react-icons/lu";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdManageAccounts,
  MdOutlineFindInPage,
  MdOutlineGroups,
} from "react-icons/md";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { RiProfileLine } from "react-icons/ri";
import { SlSupport } from "react-icons/sl";
import { Link, useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";
import { TbBasketStar } from "react-icons/tb";
import { MdIntegrationInstructions } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import MobileNotification from "./notification/NotificationMobile";
// import MobileNotification from "./NotificationMobile";
import { LuLayoutDashboard } from "react-icons/lu";
import { VscPreview } from "react-icons/vsc";
import { Badge } from "@mui/material";

function Header() {
  let [dropDown, setDropDown] = useState(false);
  let [uploadfileDropDown, setUploadFileDropDown] = useState(false);
  let [tutorialDropDown, setTutorialDropDown] = useState(false);
  let [settingDropDown, setSettingDropDown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  let {
    userDetails,
    setUserDetails,
    setLinkedinLoading,
    notification,
    setNotification,
    newNotification,
    setNewNotification,
  } = useUserState();
  let navigate = useNavigate();

  const dropDownToggle = () => {
    setDropDown(!dropDown);
  };

  const uploadfileDropDownToggle = () => {
    setUploadFileDropDown(!uploadfileDropDown);
    setSettingDropDown(false);
    setTutorialDropDown(false);
  };

  const tutorialDropDownToggle = () => {
    setTutorialDropDown(!tutorialDropDown);
    setUploadFileDropDown(false);
    setSettingDropDown(false);
  };

  const settingDropDownToggle = () => {
    setSettingDropDown(!settingDropDown);
    setUploadFileDropDown(false);
    setTutorialDropDown(false);
  };

  function logoutHandler() {
    setDropDown(false);
    localStorage.removeItem("Gamalogic_token");
    setUserDetails(null);
    navigate("/signin");
    window.reloadThriveWidget();
  }
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setNewNotification(0);
  };

  const [notifications, setNotifications] = useState([]);

  return (
    <div className="  items-center text-white lg:hidden ">
      <div
        className=" px-6 py-4 flex justify-between underlineLi"
        style={{ backgroundColor: "#0A0E2B" }}
      >
        {" "}
        <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        <div className="flex">
          <p
            className=" rounded-lg px-4 flex items-center mr-2 cursor-pointer"
            onClick={toggleNotifications}
          >
            <Badge badgeContent={newNotification} color="error">
              <IoIosNotifications className="w-6 h-6 text-white" />
            </Badge>{" "}
          </p>
          {dropDown ? (
            <IoCloseSharp onClick={dropDownToggle} className="text-3xl" />
          ) : (
            <IoReorderThree className="text-3xl" onClick={dropDownToggle} />
          )}
        </div>
      </div>
      {showNotifications && (
        <div>
          <MobileNotification
            notifications={notification}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      )}
      {dropDown && (
        <div
          className="pb-10"
          style={{ backgroundColor: "rgba(10, 14, 43,0.97)" }}
        >
          <ul className="mb-14 text-lg font-semibold text-left px-8">
            <Link to="/dashboard/user-dashboard" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <LuLayoutDashboard className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Dashboard
              </li>
            </Link>
            <Link to="/dashboard/quick-validation" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <GrDocumentVerified className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Quick Validation
              </li>
            </Link>
            <Link to="/dashboard/email-finder" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <IoSearchOutline className="text-teal-800 mt-1 mx-2 text-lg" />
                Email Finder
              </li>
            </Link>
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/apikey" onClick={dropDownToggle}>
                <li className="py-2 flex underlineLi">
                  <LuKey className="text-teal-800 mt-1 mx-2 text-lg" />
                  API Key
                </li>
              </Link>
            )}
            <li
              className="py-2 flex underlineLi"
              onClick={uploadfileDropDownToggle}
            >
              <LuFileUp className="text-teal-800 mt-1 mx-2 text-lg" /> Upload
              Your File
              {!uploadfileDropDown ? (
                <MdArrowDropDown className="mt-1 text-xl" />
              ) : (
                <MdArrowDropUp className="mt-1 text-xl" />
              )}
            </li>
            {uploadfileDropDown && (
              <ul className="ml-6 ">
                <Link to="/dashboard/file-upload" onClick={dropDownToggle}>
                  <li className="py-2 flex ">
                    <LuFileUp className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Email Verification
                  </li>
                </Link>
                <Link
                  to="/dashboard/file-upload-finder"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex ">
                    <LuFileUp className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Email Finder
                  </li>
                </Link>
              </ul>
            )}
            <Link to="/dashboard/Integrate" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <MdIntegrationInstructions className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Integration
              </li>
            </Link>
            <li
              className="py-2 flex underlineLi"
              onClick={tutorialDropDownToggle}
            >
              <CgFileDocument className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
              Tutorial
              {!tutorialDropDown ? (
                <MdArrowDropDown className="mt-1 text-xl" />
              ) : (
                <MdArrowDropUp className="mt-1 text-xl" />
              )}
              {/* <MdArrowDropDown className="mt-1 text-xl" /> */}
            </li>
            {tutorialDropDown && (
              <ul className="ml-6">
                <a
                  href="https://docs.gamalogic.com/"
                  target="_blank"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex ">
                    <IoMailOutline className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    API Docs
                  </li>
                </a>
                <a
                  href="https://blog.gamalogic.com/email-validation-google-sheets-add-on/"
                  target="_blank"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex ">
                    <MdOutlineFindInPage className="text-teal-800 mt-1 mx-2 text-xl" />{" "}
                    Find Any Email
                  </li>
                </a>
                <a
                  href="https://blog.gamalogic.com/find-email-address-using-name-and-company-on-google-sheets-add-on/"
                  target="_blank"
                  onClick={dropDownToggle}
                >
                  <li className="py-2 flex underlineLi">
                    <RiProfileLine className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Integrate Google sheets
                  </li>
                </a>
              </ul>
            )}

            <li
              className="py-2 flex underlineLi"
              onClick={settingDropDownToggle}
            >
              <IoSettingsOutline className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
              Settings
              {!settingDropDown ? (
                <MdArrowDropDown className="mt-1 text-xl" />
              ) : (
                <MdArrowDropUp className="mt-1 text-xl" />
              )}
            </li>
            {settingDropDown && (
              <ul className="ml-6 ">
                <Link to="/dashboard/account-settings" onClick={dropDownToggle}>
                  <li className="py-2 flex ">
                    <MdManageAccounts className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Account Settings
                  </li>
                </Link>
                {userDetails.isTeam == 1 && userDetails.isTeamMember != 1 && (
                  <Link to="dashboard/team" onClick={dropDownToggle}>
                    <li className="py-2 flex ">
                      <MdOutlineGroups className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                      Team Settings
                    </li>
                  </Link>
                )}
              </ul>
            )}

            {/* <Link to="/dashboard/account-settings" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <IoSettingsOutline className="text-teal-800 mt-1 mx-2 text-lg" />
                Account Settings
              </li>
            </Link> */}
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/buy-credits" onClick={dropDownToggle}>
                <li className="py-2 flex underlineLi">
                  <PiCurrencyDollarSimpleBold className="text-teal-800 mt-1 mx-2 text-lg" />
                  Buy Credits
                </li>
              </Link>
            )}
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/billing" onClick={dropDownToggle}>
                <li className="py-2 flex underlineLi">
                  <LuHistory className="text-teal-800 mt-1 mx-2 text-lg" />
                  Billing
                </li>
              </Link>
            )}
            <Link to="/dashboard/affiliate" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <GrMoney className="text-teal-800 mt-1 mx-2 text-lg" />
                Become an Affiliate
              </li>
            </Link>
            <Link to="/dashboard/EarnPoints" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <TbBasketStar className="text-teal-800 mt-1 mx-2 text-lg" />
                Earn Free Credits
              </li>
            </Link>
            <Link to="/dashboard/ReviewUs" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <VscPreview className="text-teal-800 mt-1 mx-2 text-lg" />
                Review Us
              </li>
            </Link>
            {/* {userDetails.isTeam == 1 && (
              <Link to="/dashboard/team" onClick={dropDownToggle}>
                <li className="py-2 flex underlineLi">
                  <MdOutlineGroups className="text-teal-800 mt-1 mx-2 text-lg" />
                  Team
                </li>
              </Link>
            )} */}
            {/* <Link to="/dashboard/support" onClick={dropDownToggle}>
              <li className="py-2 flex underlineLi">
                <SlSupport className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Support
              </li>
            </Link> */}

            <li className="py-2 flex underlineLi" onClick={logoutHandler}>
              <IoLogOutOutline className="text-teal-800 mt-1 mx-2 " />
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Header;
