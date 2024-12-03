function MobileNotification({ notifications, onClose }) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full h-full bg-white z-50 sm:w-72 sm:right-64 sm:left-auto sm:top-24 sm:h-auto sm:rounded-lg shadow-lg border">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h4 className="font-semibold text-gray-700">Notifications</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <ul className="p-4 h-full overflow-y-auto mb-4">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <li
                key={index}
                className="mb-2 flex items-center last:mb-0 text-sm text-gray-600 border-b pb-2"
              >
                <img
                  src={notif.imageUrl}
                  alt="feature image"
                  className="w-10 h-10 mr-2 rounded-full"
                />
                <span>{notif.name}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">No new notifications.</li>
          )}
        </ul>
      </div>
    );
  }
  
  export default MobileNotification;
  