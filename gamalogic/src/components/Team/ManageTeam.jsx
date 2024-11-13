import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosInstance";
import { MdAddTask, MdDeleteForever } from "react-icons/md";
import RemoveTeamMemberAlert from "./RemoveTeamMemberAlert";
import LoadingBar from "react-top-loading-bar";
import RemoveInviteMember from "./RemoveInviteMemberAlert";

const ManageTeam = () => {
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(30);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showInvitatoinAlert, setShowInvitationAlert] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);

  useEffect(() => {
    // Fetch accounts with data from the server
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        setLoad(30);
        const res = await axiosInstance.get("/getTeamDetails");
        setLoad(100);
        const members = res.data.teamMembers;
        setAccounts(members);
        const invited = res.data.invited;
        setInvites(invited);
      } catch (error) {
        setError("Failed to fetch team details");
      }
    };
    fetchTeamDetails();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const emailExists = invites.some(
        (invite) => invite.emailaddress === email
      );
      if (!emailExists) {
        const newAccount = { emailaddress: email };
        setInvites([...invites, newAccount]);
      }
      setLoading(true);
      setLoad(30);
      await axiosInstance.post("/sendSecondaryUserInvite", { email });
      setLoad(100);
      setEmail("");
      toast.success("Invitation link has been successfully sent");
      setLoading(false);
    } catch (error) {
      setError("Failed to add account");
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (emailToDelete) => {
    try {
      console.log(emailToDelete, "email to delete");
      setLoading(true);
      setLoad(30);
      setAccounts(
        accounts.filter((account) => account.emailid !== emailToDelete)
      );
      await axiosInstance.post("/deleteFromTeam", { email: emailToDelete });
      setLoad(100);
      toast.success("Removed user succesfully");
      setLoading(false);
    } catch (error) {
      setError("Failed to delete account");
      setLoading(false);
    }
  };

  const handleRemoveInvite = async (emailToDelete) => {
    try {
      console.log(emailToDelete, "invite to delete");
      setLoading(true);
      setLoad(30);
      setInvites(
        invites.filter((account) => account.emailaddress !== emailToDelete)
      );
      await axiosInstance.post("/deleteTeamMemberInvite", {
        email: emailToDelete,
      });
      setLoad(100);
      toast.success("Removed Invite succesfully");
      setLoading(false);
    } catch (error) {
      setError("Failed to delete Invite");
      setLoading(false);
    }
  };

  async function handleRemoveUser(email) {
    setEmailToDelete(email);
    setShowAlert(true);
  }
  const handleAccept = async () => {
    try {
      setShowAlert(false);
      if (emailToDelete) {
        await handleDeleteAccount(emailToDelete);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      setShowAlert(false);
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };

  async function handleRemoveinvitation(email) {
    setEmailToDelete(email);
    setShowInvitationAlert(true);
  }
  const handleInviationCancelAccept = async () => {
    try {
      setShowInvitationAlert(false);
      if (emailToDelete) {
        await handleRemoveInvite(emailToDelete);
      }
      console.log("its workinggggg");
    } catch (error) {
      console.error("Error removing user:", error);
      setShowInvitationAlert(false);
    }
  };

  const handleInviationCancelDismiss = () => {
    setShowInvitationAlert(false);
  };

  return (
    <div className="p-6 subHeading bg-white rounded-lg shadow-md mt-12">
      <h3 className="text-2xl font-bold mb-4">Manage Team</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && (
        <LoadingBar
          color="#f74c41"
          progress={load}
          onLoaderFinished={() => {}}
        />
      )}
      <div className="mb-4">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-1 px-2 border border-gray-300 rounded-md mr-2 "
        />
        <button
          onClick={handleAddAccount}
          className="bg-bgblue hover:bg-slate-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
        >
          INVITE USER
        </button>
      </div>
      {showAlert && (
        <div>
          <RemoveTeamMemberAlert
            onAccept={handleAccept}
            onDismiss={handleDismiss}
          />
        </div>
      )}
      {showInvitatoinAlert && (
        <div>
          <RemoveInviteMember
            onAccept={handleInviationCancelAccept}
            onDismiss={handleInviationCancelDismiss}
          />
        </div>
      )}
      {/* Members Section */}
      <ul className="space-y-4 mt-12">
        {(accounts.length>0||invites.length>0)&&<h3>Members</h3>}
        {accounts.map((account, index) => (
          <li
            key={index}
            className="flex flex-col md:flex-row justify-between items-center p-4  bg-gray-100 rounded shadow"
          >
            <span>{account.emailid}</span>
            <div className="flex flex-col md:flex-row justify-between items-center w-full mr-2  md:w-2/6 xl:w-1/6">
              <div className="text-gray-400 font-medium text-sm my-2 md:my-0">
                <p>Member</p>
              </div>
              <button
                onClick={() => handleRemoveUser(account.emailid)}
                className="p-2 mx-4 flex  items-center bg-red-500 text-sm text-white rounded hover:bg-red-700"
              >
                <MdDeleteForever className=" w-4 h-4 " />
              </button>
            </div>
          </li>
        ))}
        {invites.map((account, index) => (
          <li
            key={index}
            className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-100 rounded shadow"
          >
            <span>{account.emailaddress}</span>

            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 font-medium text-sm my-2 md:my-0 w-full mr-2  md:w-2/6 xl:w-1/6">
              <div className=" w-20 flex  items-center text-green-500 font-medium">
                <p>Invited</p>
                <MdAddTask className="text-green-500 w-6 h-6 ml-2" />
              </div>

              <button
                onClick={() => handleRemoveinvitation(account.emailaddress)}
                className="p-2 mx-4 flex  items-center bg-red-500 text-sm text-white rounded hover:bg-red-700"
              >
                <MdDeleteForever className=" w-4 h-4 " />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTeam;
