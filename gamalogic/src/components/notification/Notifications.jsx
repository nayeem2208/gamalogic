import { useState } from "react";
import SingleNotification from "./SingleNotification";
import axiosInstance from "../../axios/axiosInstance";
import { useUserState } from "../../context/userContext";

function Notification({ notifications, onClose }) {
  const [singleNotification, setSingleNotification] = useState(null);
  let {notification,
    setNotification,
    newNotification,
    setNewNotification}=useUserState()
  // console.log(notifications, "notifications");

  const formatTime = (time) => {
    const notifDate = new Date(time);
    const today = new Date();

    const isSameDay = notifDate.toDateString() === today.toDateString();

    return isSameDay
      ? notifDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : notifDate.toLocaleDateString();
  };

  const handleNotificationClick = (notif) => {
    setSingleNotification(notif);
  };

  const handleCloseModal = (data) => {
    let closeAll = true;
    if (singleNotification) {
      closeAll = false;
    }
    setSingleNotification(null);
    if (closeAll) {
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      let response= await axiosInstance.post("/markAllasRead");
      if (response.data.success) {
        // Update local state to reflect all notifications are read
        setNotification((prevNotifications) =>
          prevNotifications.map((notif) => ({
            ...notif,
            isRead: 1,
          }))
        );
        setNewNotification(0)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hasUnread = notifications.some((notif) => notif.isRead == 0);
  console.log(singleNotification, "single notificatoin");
  return (
    <div className="fixed top-24 right-64  min-w-96 max-w-[500px]  bg-white border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">Notifications</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      {singleNotification && (
        <SingleNotification
          isOpen={!!singleNotification}
          onClose={handleCloseModal}
          singleNotification={singleNotification}
        />
      )}{" "}
      <ul className="p-0 max-h-96 overflow-y-auto mb-4">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <li
              key={index}
              onClick={() => setSingleNotification(notif)}
              className={`p-3 flex flex-col last:mb-0 text-sm text-gray-600 border-b pb-4  ${
                notif.isRead == 0
                  ? "bg-gray-200  font-medium border-gray-100"
                  : "font-normal"
              }`}
            >
              {/* Header */}
              {/* Content */}
              <div className="flex justify-between space-x-15">
                <div className=" text-gray-600 w-4/5">{notif.header}</div>

                <div className="text-xs text-gray-400 mt-1 w-1/5 text-right">
                  {formatTime(notif.time)}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500 p-3">No new notifications.</li>
        )}
      </ul>
      {hasUnread && (
        <div className="p-2 border-t flex justify-center">
          <button
            onClick={handleMarkAllRead}
            className=" text-xs text-gray-500"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}

export default Notification;
