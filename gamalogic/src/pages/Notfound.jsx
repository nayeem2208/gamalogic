import React, { useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "../../public/Animation - 1715590082912(1).json";
const defaultOptions = {
  loop: false,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
function NotFound() {
    const [isLottieLoaded, setIsLottieLoaded] = useState(true); 
    const handleLottieError = () => {
        setIsLottieLoaded(false);
      };
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center text-white">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
      {isLottieLoaded ? (
          <Lottie
            options={defaultOptions}
            height={400}
            width={700}
            style={{ width: "50%", height: "auto" }}
            eventListeners={[
              {
                eventName: "error",
                callback: handleLottieError,
              },
            ]}
          />
        ) : (
          <p className="text-9xl font-bold">404</p>
        )}
        <p className="text-4xl font-semibold">PAGE NOT FOUND</p>
        <Link
          to="/"
          className="border rounded-xl px-4 mt-4 py-1 border-cyan-500 text-xl"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
