import { FaEye } from "react-icons/fa";
import SubHeader from "../components/SubHeader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useUserState } from "../context/userContext";
import ServerError from "./ServerError";
import LoadingBar from "react-top-loading-bar";
import MoreDetails from "../components/MoreDetails";
import { MdOutlineGroups } from "react-icons/md";
import AccountDetailsModal from "../components/AccountDetailsModa";
import DeleteAccount from "../components/DeleteAccount/DeleteAccount";
import TimeZone from "../components/TimeZone";

function AccountSettings() {
  let [passwordVisible, setPasswordVisible] = useState({
    old: false,
    newPassword: false,
    confirm: false,
  });
  let [passwordData, setPasswordData] = useState({
    old: "",
    newPassword: "",
    confirm: "",
  });
  let [serverError, setServerError] = useState(false);
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let {
    setUserDetails,
    userDetails,
    accountDetailsModal,
    setAccountDetailsModal,
  } = useUserState();

  useEffect(() => {
    if (userDetails.password == false) {
      setPasswordData((prevState) => ({
        ...prevState,
        old: "PasswordForgoogleUsers",
      }));
    }
    if (APP == "beta") {
      document.title = "Account Settings | Beta Dashboard";
    } else {
      document.title = "Account Settings | Dashboard";
    }
  }, []);

  const passwordVisibilityHandler = (field) => {
    setPasswordVisible((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  useEffect(() => {
    if (userDetails.password == false) {
      setPasswordData((prevState) => ({
        ...prevState,
        old: "PasswordForgoogleUsers",
      }));
    }
  }, []);

  useEffect(() => {
    if (userDetails.accountDetailsModal) setAccountDetailsModal(true);
  }, [userDetails]);

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?!\s).{6,}$/;
  let changaePassword = async (e) => {
    e.preventDefault();
    try {
      const trimmedOldPassword = passwordData.old.trim();
      const trimmedNewPassword = passwordData.newPassword.trim();
      const trimmedConfirmPassword = passwordData.confirm.trim();
      if (
        !trimmedOldPassword ||
        !trimmedNewPassword ||
        !trimmedConfirmPassword
      ) {
        toast.error("Please fill in all the password fields.");
        return;
      }
      if (trimmedOldPassword == trimmedNewPassword) {
        toast.error("Please give a new password.");
        return;
      }
      if (trimmedNewPassword !== trimmedConfirmPassword) {
        toast.error("New and confirm passwords do not match.");
        return;
      }

      if (!passwordPattern.test(trimmedNewPassword)) {
        toast.error(
          "Please ensure your password contains at least 6 characters, including both letters and numbers."
        );
        return;
      }
      setLoading(true);
      setLoad(30);
      let response = await axiosInstance.post("/changePassword", passwordData);
      if (response.data.googleUser == 1) {
        const storedToken = localStorage.getItem("Gamalogic_token");
        if (storedToken) {
          let token;
          try {
            token = JSON.parse(storedToken);
          } catch (error) {
            token = storedToken;
          }
          token.password = true;
          localStorage.setItem("Gamalogic_token", JSON.stringify(token));
          setUserDetails(token);
        }
      }
      setLoad(100);
      toast.success("Password succesfully updated");
      setPasswordData({
        old: "",
        newPassword: "",
        confirm: "",
      });
    } catch (error) {
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.message);
      }
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.get("/createTeamAccount");
      const response = await axiosInstance.get("/createTeamAccount");

      if (response.status === 200) {
        toast.success("Email has been sent to your account");
      } else {
        toast.error("Failed to send email. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;

      if (
        errorMessage === "Please fill all the required fields to create a team"
      ) {
        const storedToken = localStorage.getItem("Gamalogic_token");
        if (storedToken) {
          let token;
          try {
            token = JSON.parse(storedToken);
          } catch (error) {
            token = storedToken;
          }
          token.accountDetailsModal = true;
          localStorage.setItem("Gamalogic_token", JSON.stringify(token));
          setUserDetails(token);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteAccount = () => {
    // Logic to delete the user account
    console.log("Account deleted");
  };
  if (serverError) {
    return <ServerError />;
  }
  return (
    <div className=" px-6 md:px-20 py-8 accountSettings text-center sm:text-start overflow-hidden">
      <SubHeader SubHeader={"Account Settings"} />
      {accountDetailsModal && (
        <AccountDetailsModal isOpen={accountDetailsModal} />
      )}
      {userDetails.confirm == 1 ? (
        <>
          <div className="subHeading ">
            <h3 className="mt-8">Your Profile</h3>
            {loading && (
              <LoadingBar
                color="#f74c41"
                progress={load}
                onLoaderFinished={() => {}}
              />
            )}
            <p className="mt-6 mb-1 text-sm">Your Email</p>
            <input
              type="email"
              placeholder="enter the email here"
              className="input-box-readonly w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3 selection:border-gray-400"
              value={userDetails.email}
              readOnly
            />{" "}
            <MoreDetails />
          </div>
          <form
            className="mt-6 sm:mt-14 text-xs sm:text-sm text-bgblue subHeading border-t-2 py-8"
            onSubmit={changaePassword}
            style={{ fontFamily: "Raleway,sans-serif" }}
          >
            {!userDetails.firstname && !userDetails.lastname && (
              <div>
                <p className="mt-6 mb-1 text-sm">Your Name</p>
                <input
                  type="text"
                  placeholder="enter your name here"
                  className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
                  value={userDetails.name}
                  readOnly
                />{" "}
              </div>
            )}

            <h3 className="mt-6 mb-1">Change Your Password</h3>
            <p className="my-7 description">
              Changing your Gamalogic password to a secure password that only
              you know and that no one else can guess protects your private
              information from unauthorized access.
            </p>
            {userDetails.password == true && (
              <p className="mt-6 mb-1 text-sm">Old Password</p>
            )}
            {userDetails.password == true && (
              <div className="flex bg-transparent  justify-between items-center  sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3 text-gray-400 my-1">
                <input
                  className="bg-transparent w-5/6  outline-none"
                  type={passwordVisible.old ? "text" : "password"}
                  name="old"
                  id="password"
                  placeholder="Enter your old password"
                  onChange={handleInputChange}
                  value={passwordData.old}
                />
                <FaEye
                  className="w-4 h-4 text-slate-900 ml-2"
                  onClick={() => passwordVisibilityHandler("old")}
                />
              </div>
            )}
            <p className="mt-6 mb-1 text-sm">New Password</p>
            <div className="flex bg-transparent  justify-between items-center  sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3 text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6  outline-none"
                type={passwordVisible.newPassword ? "text" : "password"}
                name="newPassword"
                id="password"
                placeholder="Enter your new password"
                onChange={handleInputChange}
                value={passwordData.newPassword}
              />
              <button className="group relative inline-flex items-center justify-center  text-sm font-medium ">
                <IoInformationCircleOutline className="w-5 h-5 text-slate-900 ml-2" />
                <div className="ease-in duration-300 opacity-0 group-hover:block group-hover:opacity-100 transition-all">
                  <div className="ease-in-out duration-500 -translate-y-4 pointer-events-none transition-all group-hover:-translate-y-16 absolute left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-sm text-center text-sm text-slate-300 before:-top-2">
                    <div className="rounded-sm bg-black py-1 px-2">
                      <p className="whitespace-nowrap">
                        Please ensure your password <br /> contains at least 6
                        characters,
                        <br /> including both letters and numbers.{" "}
                      </p>
                    </div>
                    <div className="h-0 w-fit border-l-8 border-r-8 border-t-8 border-transparent border-t-black"></div>
                  </div>
                </div>
              </button>
              <FaEye
                className="w-4 h-4 text-slate-900 "
                onClick={() => passwordVisibilityHandler("newPassword")}
              />
            </div>
            <p className="mt-6 mb-1 text-sm">Confirm Password</p>
            <div className="flex bg-transparent  justify-between items-center sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3 text-gray-400 my-1">
              <input
                className="bg-transparent w-5/6  outline-none"
                type={passwordVisible.confirm ? "text" : "password"}
                name="confirm"
                id="password"
                placeholder="Confirm your new password"
                onChange={handleInputChange}
                value={passwordData.confirm}
              />
              <FaEye
                className="w-4 h-4 text-slate-900 ml-2"
                onClick={() => passwordVisibilityHandler("confirm")}
              />
            </div>
            <br />
            <button
              className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium"
              type="submit"
            >
              CHANGE PASSWORD
            </button>
          </form>
          <TimeZone/>
          {userDetails.isTeamMember != 1 && (
            <div className="subHeading mt-14 shadow-lg px-6 py-12  bg-gray-100">
              <h3 className="flex">
                Create Team Account{" "}
                <MdOutlineGroups className=" mt-2 mx-2 text-lg w-6 h-6" />
              </h3>
              <div>
                <p className="my-7 description">
                  Become the admin of your team to unlock advanced features for
                  managing team members and sharing resources.
                </p>
                <div className="advantages my-5">
                  <h4 className="font-semibold text-lg mb-2">
                    Why Create a Team Account?
                  </h4>
                  <ul className="list-disc list-inside">
                    <li>
                      <span className="font-semibold mr-1">
                        Centralized Management:
                      </span>{" "}
                      Easily oversee and manage all user accounts from a single
                      dashboard.
                    </li>
                    <li>
                      <span className="font-semibold mr-1">
                        Credit Sharing:
                      </span>{" "}
                      Seamlessly share credits across all member accounts.
                    </li>
                    <li>
                      <span className="font-semibold mr-1">
                        Enhanced Collaboration:
                      </span>{" "}
                      Allow team members to access necessary resources and
                      collaborate effectively.
                    </li>
                    <li>
                      <span className="font-semibold mr-1">
                        Controlled Access:
                      </span>{" "}
                      Limit access to uploaded files for member accounts, giving
                      them access only to their own uploads.
                    </li>
                    <li>
                      <span className="font-semibold mr-1">
                        Scalable Solution:
                      </span>{" "}
                      As your team grows, add more members and manage them with
                      ease.
                    </li>
                  </ul>
                </div>
                {userDetails.isTeam == 1 ? (
                  <button
                    // onClick={handleCreateTeam}
                    className="bg-bgblue hover:bg-slate-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
                  >
                    DELETE TEAM
                  </button>
                ) : (
                  <button
                    onClick={handleCreateTeam}
                    className="bg-bgblue hover:bg-slate-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
                  >
                    CREATE & BECOME ADMIN
                  </button>
                )}
              </div>{" "}
            </div>
          )}
          <DeleteAccount handleDeleteAccount={handleDeleteAccount}/>
        </>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to view account settings.
        </p>
      )}
    </div>
  );
}

export default AccountSettings;
