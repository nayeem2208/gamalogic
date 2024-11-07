import React, { useState, useEffect } from "react";

const ManageTeam = () => {
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch accounts with dummy data
    const fetchDummyAccounts = () => {
      const dummyData = [
        { id: 1, email: "user1@example.com", status: "admin" },
        { id: 2, email: "user2@example.com", status: "member" },
        { id: 3, email: "user3@example.com", status: "viewer" },
      ];
      setAccounts(dummyData);
    };
    fetchDummyAccounts();
  }, []);

  const handleAddAccount = () => {
    if (!email) return;
    try {
      setLoading(true);
      const newAccount = { id: accounts.length + 1, email, status: "member" };
      setAccounts([...accounts, newAccount]);
      setEmail("");
      setLoading(false);
    } catch (error) {
      setError("Failed to add account");
      setLoading(false);
    }
  };
  const handleDeleteAccount = (accountId) => {
    try {
      setLoading(true);
      setAccounts(accounts.filter((account) => account.id !== accountId));
      setLoading(false);
    } catch (error) {
      setError("Failed to delete account");
      setLoading(false);
    }
  };

  const handleStatusChange = (accountId, newStatus) => {
    setAccounts(
      accounts.map((account) =>
        account.id === accountId ? { ...account, status: newStatus } : account
      )
    );
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
          className="py-1 px-2 border border-gray-300 rounded-md mr-2"
        />
        <button
          onClick={handleAddAccount}
          className="bg-bgblue hover:bg-slate-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
        >
          ADD NEW ACCOUNT
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <ul className="space-y-4 mt-12">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex justify-between items-center p-4 bg-gray-100 rounded shadow"
          >
            <span>{account.email}</span>
            <div>
              <select
                value={account.status}
                onChange={(e) => handleStatusChange(account.id, e.target.value)}
                className="input-box p-2 border border-gray-300 rounded text-sm "
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="p-2 mx-4 bg-red-500 text-sm text-white rounded hover:bg-red-700"
              >
                {" "}
                Delete{" "}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTeam;
