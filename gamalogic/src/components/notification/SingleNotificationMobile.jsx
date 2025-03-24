import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useUserState } from "../../context/userContext";
import axiosInstance from "../../axios/axiosInstance";

function SingleNotificationMobile({ isOpen, onClose, singleNotification }) {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);
  let { notification, setNotification,setNewNotification } = useUserState();

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);
  useEffect(() => {
    const notificationIsRead = async () => {
      try {
        if (singleNotification?.id) {
          if(singleNotification.isRead=='0'){
            setNewNotification((prev)=>prev-1)
          }
          // Call the API to update the isRead status
          let res = await axiosInstance.get(
            `/notificationIsReadStatusChange?id=${singleNotification.id}`
          );

          // Update the local state to reflect the change
          if (res.data.message === "Notification marked as read") {
            setNotification((prevNotifications) =>
              prevNotifications.map((notif) =>
                notif.id === singleNotification.id
                  ? { ...notif, isRead: 1 }
                  : notif
              )
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    notificationIsRead();
  }, [singleNotification?.id]);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      border: "none",
      borderRadius: 15,
      padding: 6,
      height: "60%",
      width: "90%",
      maxWidth: "700px",
      maxHeight: "calc(150vh - 100px)",
      zIndex: 1000,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
    },
  };

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={onClose}
      style={customStyles}
      appElement={document.getElementById("root")}
      ariaHideApp={false}
    >
      <div className="mb-24 md:mb-20  px-6 flex flex-col justify-center items-center w-full h-full ">
        <div
          className="text-xs sm:text-sm text-bgblue subHeading"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          <h2 className="font-semibold">{singleNotification?.header}</h2>
          <p>{singleNotification?.content}</p>
          <p className="font-light mt-2">
            {new Date(singleNotification?.time).toLocaleString()}
          </p>
        </div>
      </div>
    </ReactModal>
  );
}

export default SingleNotificationMobile;
