import React, { useState, useEffect, useRef } from "react";
import ReactModal from "react-modal";
import YouTube from "react-youtube";
import { IoClose } from "react-icons/io5";

const VideoModal = ({ videoId, isOpen, onClose }) => {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);
  const playerRef = useRef(null);
  console.log(videoId, "video idddddddddddddddddddd");
  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]); // Update modal state based on isOpen prop

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#e2e8f0",
      border: "none",
      borderRadius:0,
      padding: 6,
      //   width: "60%",
      height: "65vh",
      width: "80%", // Set a base width for responsiveness
      maxWidth: "650px",
      maxHeight: "calc(100vh - 100px)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  };

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={onClose}
      style={customStyles}
    >
      <div className="video-modal-content ">
        <div className="w-full  flex justify-end md:pr-4">
          <button onClick={onClose} className="text-right my-2 font-semibold ">
            <IoClose className="h-6 w-6 hover:text-red-500" />
          </button>
        </div>
        <YouTube
          videoId={videoId}
          opts={{ width: "100%", height: "340vw", playerVars: { autoplay: 1,controls:0 } }}
        />
        <div className="text-center">
          <p className="text-xs md:text-sm my-2 ">
            is simply dummy text of the printing and typesetting industry. Lorem
            Ipsum has been the industry's standard dummy text ever since the
            1500s, when an unknown printer took a galley of type and scrambled
            it to make a type specimen book.{" "}
          </p>
          <button className="bg-bgblue  text-white py-1 px-4 rounded-md ml-2  w-3/6 h-9 text-sm font-medium">
            Click here
          </button>
        </div>
      </div>
    </ReactModal>
  );
};

export default VideoModal;
