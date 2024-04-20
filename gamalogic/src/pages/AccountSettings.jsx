import { FaEye } from "react-icons/fa";
import SubHeader from "../components/SubHeader";
import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../axios/axiosInstance";
import { IoInformationCircleOutline } from "react-icons/io5";

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
      let changePassword = await axiosInstance.post(
        "/changePassword",
        passwordData
      );
      toast.dark("Password succesfully updated");
      setPasswordData({
        old: "",
        newPassword: "",
        confirm: "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className=" px-20 py-8 ">
      <SubHeader SubHeader={"Account Settings"} />
      <form className="mt-14 text-bgblue subHeading" onSubmit={changaePassword}>
        <h3>Your Profile</h3>
        <p className="mt-6 mb-1">Your Name</p>
        <input
          type="text"
          placeholder="enter your name here"
          className="w-3/6 border border-gray-100 rounded py-2 px-4 mr-3"
          value="NAYEEM"
          readOnly
        />{" "}
        <p className="mt-6 mb-1">Your Email</p>
        <input
          type="email"
          placeholder="enter the email here"
          className="w-3/6 border border-gray-100 rounded py-2 px-4 mr-3 selection:border-gray-400"
          value="nayeem2281998@gmail.com"
          readOnly
        />{" "}
        <h3 className="mt-6 mb-1">Change Your Password</h3>
        <p className="my-7 description">
          Changing your Gamalogic password to a secure password that only you
          know and that no one else can guess protects your private information
          from unauthorized access.
        </p>
        <p className="mt-6 mb-1">Old Password</p>
        <div className="flex bg-transparent  justify-between items-center  w-3/6 border border-gray-100 rounded py-2 px-4 mr-3 text-gray-400 my-1">
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
        <p className="mt-6 mb-1">New Password</p>
        <div className="flex bg-transparent  justify-between items-center w-3/6 border border-gray-100 rounded py-2 px-4 mr-3 text-gray-400 my-1">
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
        <p className="mt-6 mb-1 ">Confirm Password</p>
        <div className="flex bg-transparent  justify-between items-center w-3/6 border border-gray-100 rounded py-2 px-4 mr-3 text-gray-400 my-1">
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
          className="bg-bgblue text-white py-1  px-4 rounded-md mt-6"
          type="submit"
        >
          CHANGE PASSWORD
        </button>
      </form>
    </div>
  );
}

export default AccountSettings;
