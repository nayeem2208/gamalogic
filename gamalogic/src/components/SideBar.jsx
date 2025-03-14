import { GrDocumentVerified } from "react-icons/gr";
import {
  IoLogOutOutline,
  IoMailOutline,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuKey, LuFileUp, LuHistory } from "react-icons/lu";
import { CgFileDocument } from "react-icons/cg";
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { SlSupport } from "react-icons/sl";
import {
  MdArrowDropDown,
  MdArrowDropUp,
  MdOutlineFindInPage,
} from "react-icons/md";
import { RiProfileLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";
import { GrMoney } from "react-icons/gr";
import { MdOutlineGroups } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
import { TbBasketStar } from "react-icons/tb";
import { MdIntegrationInstructions } from "react-icons/md";
import { LuLayoutDashboard } from "react-icons/lu";
import { VscPreview } from "react-icons/vsc";



function SideBar() {
  let [uploadfileDropDown, setUploadFileDropDown] = useState(false);
  let [tutorialDropDown, setTutorialDropDown] = useState(false);
  let [settingDropDown, setSettingDropDown] = useState(false);

  let { setUserDetails, userDetails, setLinkedinLoading,appTour } = useUserState();
  let navigate = useNavigate();

  const location = useLocation();
  // console.log(location,'locationnnnn')
  useEffect(() => {
    if (
      location.pathname === "/dashboard/file-upload" ||
      location.pathname === "/dashboard/file-upload-finder"
    ) {
      setUploadFileDropDown(true);
    } else if (
      location.pathname === "/dashboard/account-settings" ||
      location.pathname === "/dashboard/team"
    ) {
      setSettingDropDown(true);
    }

    if (appTour) {
      setUploadFileDropDown(true);
    }
  }, [location.pathname,appTour]);

  const uploadfileDropDownToggle = () => {
    setUploadFileDropDown(!uploadfileDropDown);
  };

  const tutorialDropDownToggle = () => {
    setTutorialDropDown(!tutorialDropDown);
  };

  const settingDropDownToggle = () => {
    setSettingDropDown(!settingDropDown);
  };

  async function logoutHandler() {
    setLinkedinLoading(true);
    try {
      localStorage.removeItem("Gamalogic_token");
      setUserDetails(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLinkedinLoading(false);
      navigate("/signin");
      window.reloadThriveWidget();
    }
  }

  return (
    <>
      {userDetails && (
        <div
          style={{
            backgroundColor: "#0A0E2B",
            fontFamily: "Raleway, sans-serif",
          }}
          className="w-96 text-white hidden  lg:flex flex-col h-screen  p-4 pt-8 overflow-y-auto pb-12 "
        >
          <Link to="/">
            <p
              className="font-semibold text-xl text-center mt-1"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              GAMALOGIC
            </p>
          </Link>
          <ul className="mt-14 text-lg font-semibold text-left">
          <Link to="/dashboard/user-dashboard">
              <li className="my-4 flex ">
                <LuLayoutDashboard className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Dashboard
              </li>
            </Link>
            <Link to="/dashboard/quick-validation">
              <li className="my-4 flex email-validation-step">
                <GrDocumentVerified className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Quick Validation
              </li>
            </Link>
            <Link to="/dashboard/email-finder">
              <li className="my-4 flex email-finder-step">
                <IoSearchOutline className="text-teal-800 mt-1 mx-2 text-lg" />
                Email Finder
              </li>
            </Link>
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/apikey">
                <li className="my-4 flex">
                  <LuKey className="text-teal-800 mt-1 mx-2 text-lg" />
                  API Key
                </li>
              </Link>
            )}

            <li
              className="my-4 flex cursor-pointer"
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
              <ul className="ml-6">
                <Link to="/dashboard/file-upload">
                  <li className="my-4 flex file-validation-step">
                    <LuFileUp className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Email Verification
                  </li>
                </Link>
                <Link to="/dashboard/file-upload-finder">
                  <li className="my-4 flex large-set-finder-step">
                    <LuFileUp className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Email Finder
                  </li>
                </Link>
              </ul>
            )}
            <Link to="/dashboard/Integrate">
              <li className="my-4 flex">
                <MdIntegrationInstructions className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Integration
              </li>
            </Link>
            <li
              className="my-4 flex cursor-pointer"
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
                {/* <Link to='/api-docs'> */}
                <a href="https://docs.gamalogic.com/" target="_blank">
                  <li className="my-4 flex">
                    <IoMailOutline className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    API Docs
                  </li>
                </a>
                {/* </Link>  */}
                {/* <Link to='/googleSheet-integration'> */}
                <a
                  href="https://blog.gamalogic.com/email-validation-google-sheets-add-on/"
                  target="_blank"
                >
                  <li className="my-4 flex">
                    <RiProfileLine className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Integrate Google sheets
                  </li>
                </a>
                {/* </Link> */}
                {/* <Link to='/find-any-email'> */}
                <a
                  href="https://blog.gamalogic.com/find-email-address-using-name-and-company-on-google-sheets-add-on/"
                  target="_blank"
                >
                  <li className="my-4 flex">
                    <MdOutlineFindInPage className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                    Find Any Email
                  </li>
                </a>
                {/* </Link> */}
              </ul>
            )}

            <li
              className="my-4 flex cursor-pointer"
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
              <ul className="ml-6">
                {/* <Link to='/api-docs'> */}
                <Link to="/dashboard/account-settings">
                  <li className="my-4 flex">
                    <MdManageAccounts className="text-teal-800 mt-1 mx-2 text-lg" />
                    Account Settings
                  </li>
                </Link>
                {userDetails.isTeam == 1 && userDetails.isTeamMember != 1 && (
                  <Link to="dashboard/team">
                    <li className="my-4 flex">
                      <MdOutlineGroups className="text-teal-800 mt-1 mx-2 text-lg" />
                      Team Settings
                    </li>
                  </Link>
                )}
              </ul>
            )}
            {/* <Link to="/dashboard/account-settings">
              <li className="my-4 flex">
                <IoSettingsOutline className="text-teal-800 mt-1 mx-2 text-lg" />
                Account Settings
              </li>
            </Link> */}
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/buy-credits">
                {" "}
                <li className="my-4 flex">
                  <PiCurrencyDollarSimpleBold className="text-teal-800 mt-1 mx-2 text-lg" />
                  Buy Credits
                </li>
              </Link>
            )}
            {userDetails.isTeamMember != 1 && (
              <Link to="/dashboard/billing">
                <li className="my-4 flex">
                  <LuHistory className="text-teal-800 mt-1 mx-2 text-lg" />
                  Billing
                </li>
              </Link>
            )}
            <Link to="/dashboard/affiliate">
              <li className="my-4 flex">
                <GrMoney className="text-teal-800 mt-1 mx-2 text-lg" />
                Become an Affiliate
              </li>
            </Link>
            <Link to="/dashboard/EarnPoints">
              <li className="my-4 flex">
                <TbBasketStar className="text-teal-800 mt-1 mx-2 text-lg" />
                Earn Free Credits
              </li>
            </Link>
            <Link to="/dashboard/ReviewUs">
              <li className="my-4 flex">
                <VscPreview className="text-teal-800 mt-1 mx-2 text-lg" />
                Review Us
              </li>
            </Link>
            {/* {userDetails.isTeam == 1 && (
              <Link to="dashboard/team">
                <li className="my-4 flex">
                  <MdOutlineGroups className="text-teal-800 mt-1 mx-2 text-lg" />
                  Team
                </li>
              </Link>
            )} */}
            {/* <Link to="/dashboard/support">
              <li className="my-4 flex">
                <SlSupport className="text-teal-800 mt-1 mx-2 text-lg" />{" "}
                Support
              </li>
            </Link> */}

            <li className="my-4 flex cursor-pointer" onClick={logoutHandler}>
              <IoLogOutOutline className="text-teal-800 mt-1 mx-2 " />
              Logout
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default SideBar;
