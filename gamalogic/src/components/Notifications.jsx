import PropTypes from "prop-types";

function Notification({ notifications, onClose }) {
  return (
    <div className="fixed top-24 right-64 w-72  bg-white border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">Notifications</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <ul className="p-4 max-h-96 overflow-y-auto mb-4">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <li
              key={index}
              className="mb-2 flex items-center last:mb-0 text-sm text-gray-600 border-b pb-2"
            >
              <img
                src={notif.imageUrl}
                alt="feature image"
                className="w-10 h-10 mr-2"
              />
              {notif.name}
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500">No new notifications.</li>
        )}
      </ul>
    </div>
  );
}

export default Notification;
