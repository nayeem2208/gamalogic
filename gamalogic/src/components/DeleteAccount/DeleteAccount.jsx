import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import DeleteAccountAlert from "./DeleteAccountAlert";
import axiosInstance from "../../axios/axiosInstance";
import { useUserState } from "../../context/userContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function DeleteAccount({ handleDeleteAccount }) {
  let [showAlert, setShowAlert] = useState(false);
  let { setUserDetails } = useUserState();
  let navigate = useNavigate();

  async function handleDeleteAccount() {
    setShowAlert(true);
  }

  const handleAccept = async () => {
    console.log("Cancelling subscription...");
    try {
      setShowAlert(false);
      try {
        let res = await axiosInstance.get("/deleteAccount");
        // if (res.data?.message == "Account successfully deleted") {
        //   try {
        //     localStorage.removeItem("Gamalogic_token");
        //     setUserDetails(null);
        //   } catch (error) {
        //     console.error("Logout error:", error);
        //   } finally {
        //     navigate("/DeleteAccountSuccess");
        //     toast.success("Account has been succesfully deleted");
        //     window.reloadThriveWidget();
        //   }
        // } else {
        //   toast.error("Error deleting account");
        // }
        toast.success("A link to delete your account has been sent to your email.");
      } catch (error) {
        console.log(error);
      }
      setShowAlert(false);
    } catch (error) {
      console.error("Error Deleting account:", error);
      setShowAlert(false);
    }
  };

  const handleDismiss = () => {
    console.log("Cancellation dismissed");
    setShowAlert(false);
  };
  return (
    <div className="subHeading mt-14 shadow-lg px-6 py-12 bg-gray-100">
      <h3 className="flex items-center">
        Delete Account
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mt-2 mx-2 text-lg w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-7 7-7-7"
          />
        </svg> */}
        <MdDelete className="ml-2" />
      </h3>
      <div>
        <p className="my-7 description text-red-600">
          Warning: Deleting your account is permanent and cannot be undone. By
          proceeding, you will lose:
        </p>
        <div className="advantages my-5">
          <h4 className="font-semibold text-lg mb-2">What You Will Lose:</h4>
          <ul className="list-disc list-inside">
            <li>
              <span className="font-semibold mr-1">Available Credits:</span> All
              your remaining credits will be forfeited.
            </li>
            <li>
              <span className="font-semibold mr-1">Uploaded Files:</span> Any
              files you have uploaded will be permanently deleted.
            </li>
            <li>
              <span className="font-semibold mr-1">Account Access:</span> You
              will no longer have access to this account.
            </li>
          </ul>
        </div>
        {showAlert && (
          <div>
            <DeleteAccountAlert
              onAccept={handleAccept}
              onDismiss={handleDismiss}
            />
          </div>
        )}
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 hover:bg-red-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
        >
          DELETE ACCOUNT
        </button>
      </div>
    </div>
  );
}

export default DeleteAccount;
