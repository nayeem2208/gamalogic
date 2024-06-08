import React, { useState, useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import YouTube from 'react-youtube';

const VideoModal = ({ videoId, isOpen, onClose }) => {
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);
  const playerRef = useRef(null);

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]); // Update modal state based on isOpen prop

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'transparent',
      border: 'none', 
      padding: 0,
      width: '70%', 
      height: '65vh',   
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black light background
    }
  };


  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={onClose}
      style={customStyles}
    >
      <div className="video-modal-content ">
        <YouTube videoId={videoId}  opts={{ width: '100%', height: '460vh', playerVars: { autoplay: 1 } }} />
          <button onClick={onClose} className="text-white my-2 font-semibold">Close</button>
      </div>      
    </ReactModal>
  );
};

export default VideoModal;
