import { useState } from "react";
import SingleNotificationMobile from "./SingleNotificationMobile";

function MobileNotification({ notifications, onClose }) {
  const [singleNotification, setSingleNotification] = useState(null);

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

  const handleCloseModal = () => {
    setSingleNotification(null);
  };
  return (
    <div className="fixed top-0 left-0 right-0 w-full h-full  bg-white z-50 sm:w-72 sm:right-64 sm:left-auto sm:top-24 sm:h-auto sm:rounded-lg shadow-lg border">
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
        <h4 className="font-semibold text-gray-700">Notifications</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      {singleNotification && (
        <SingleNotificationMobile
          isOpen={!!singleNotification}
          onClose={handleCloseModal}
          singleNotification={singleNotification}
        />
      )}
      <ul className="pb-5 h-screen overflow-y-auto mb-10">
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
    </div>
  );
}

export default MobileNotification;
