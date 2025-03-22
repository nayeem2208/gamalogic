import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useUserState } from "../../context/userContext";
import axiosInstance from "../../axios/axiosInstance";
import { useNavigate } from "react-router-dom";

function SingleNotification({ isOpen, onClose, singleNotification }) {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);
  let { notification, setNotification } = useUserState();
  let navigate = useNavigate();

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const notificationIsRead = async () => {
      try {
        if (singleNotification?.id) {
          let res = await axiosInstance.get(
            `/notificationIsReadStatusChange?id=${singleNotification.id}`
          );
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

  const handleGoToFilePage = () => {
    let filePageUrl;
    if (singleNotification.type == "validation") {
      const fileNameMatch =
        singleNotification.content.match(/for the file (.+?)\./);
      const fileName = fileNameMatch ? fileNameMatch[1] : null;
      const dateTime = singleNotification.time;

      filePageUrl = `/dashboard/file-upload?file_upload=${encodeURIComponent(
        fileName
      )}&date_time=${encodeURIComponent(dateTime)}`;
    } else if (singleNotification.type == "finder") {
      const fileNameMatch =
        singleNotification.content.match(/for the file (.+?)\./);
      const fileName = fileNameMatch ? fileNameMatch[1] : null;
      const dateTime = singleNotification.time;

      filePageUrl = `/dashboard/file-upload-finder?file_upload=${encodeURIComponent(
        fileName
      )}&date_time=${encodeURIComponent(dateTime)}`;
    }
    onClose();
    if (
      window.location.pathname.endsWith("file-upload") ||
      window.location.pathname.endsWith("file-upload-finder")
    ) {
      navigate(filePageUrl, { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      navigate(filePageUrl);
    }
  };

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
      height: "30%",
      width: "60%",
      maxWidth: "700px",
      maxHeight: "calc(150vh - 100px)",
      zIndex: 1000, // Ensure the modal is on top
      overflow: "visible",
      className: "ReactModal__Content",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000, // Ensure the overlay is on top
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
      <div className="mb-24 md:mb-20 px-6 flex flex-col justify-center items-center w-full h-full">
        <div
          className="text-xs sm:text-sm text-bgblue subHeading"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          <h2 className="font-semibold">{singleNotification?.header}</h2>
          <p>{singleNotification?.content}</p>
          <p className="font-light mt-2">
            {new Date(singleNotification?.time).toLocaleString()}
          </p>
          {/* <button
            onClick={handleGoToFilePage}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Go to File Page
          </button> */}
          {(singleNotification.type=='validation'||singleNotification.type=='finder')&&(<button
            onClick={handleGoToFilePage}
            style={{ zIndex: 1000 }}
            className="overflow-hidden md:mt-3 w-48 p-2 h-9 bg-bgblue text-white border-none rounded-md text-sm font-medium cursor-pointer relative z-10 group"
          >
            Go to File Page
            <span className="absolute w-52 h-20 -top-8 -left-2 bg-blue-300 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
            <span className="absolute w-52 h-20 -top-8 -left-2 bg-blue-800 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
            <span className="absolute w-52 h-20 -top-8 -left-2 bg-blue-900 rotate-6 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
            <span className="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute left-6 z-10">
              Go to File Page
            </span>
          </button>)}
        </div>
      </div>
    </ReactModal>
  );
}

export default SingleNotification;
