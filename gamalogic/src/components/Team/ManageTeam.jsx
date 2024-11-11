import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../axios/axiosInstance";

const ManageTeam = () => {
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch accounts with data from the server
    const fetchTeamDetails = async () => {
      try {
        const res = await axiosInstance.get('/getTeamDetails');
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
      setLoading(true);
      const emailExists = invites.some((invite) => invite.emailaddress === email);
    if (!emailExists) {
      const newAccount = { emailaddress: email }; 
      setInvites([...invites, newAccount]);
    }
      await axiosInstance.post('/sendSecondaryUserInvite', { email });
      setEmail("");
      toast.success('Invitation link has been successfully sent');
      setLoading(false);
    } catch (error) {
      setError("Failed to add account");
      setLoading(false);
    }
  };

  const handleDeleteAccount = (emailToDelete) => {
    try {
      setLoading(true);
      setAccounts(accounts.filter((account) => account.emailid !== emailToDelete)); // Delete based on emailaddress
      setLoading(false);
    } catch (error) {
      setError("Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 subHeading bg-white rounded-lg shadow-md mt-12">
      <h3 className="text-2xl font-bold mb-4">Manage Team</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
      {loading && <p>Loading...</p>}
      
      {/* Members Section */}
      <ul className="space-y-4 mt-12">
        <h3>Members</h3>
        {accounts.map((account, index) => (
          <li
            key={index}
            className="flex flex-col md:flex-row justify-between items-center p-4  bg-gray-100 rounded shadow"
          >
            <span>{account.emailid}</span> 
            <div className="flex flex-col md:flex-row justify-between items-center w-full mr-2  md:w-2/6 xl:w-1/6">
              <div className="text-gray-600 text-sm my-2 md:my-0">
                <p>Member</p>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.emailid)} 
                className="p-2 mx-4 bg-red-500 text-sm text-white rounded hover:bg-red-700"
              >
                Delete
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
            <div className=" w-20"><p>Invited</p></div>
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default ManageTeam;
