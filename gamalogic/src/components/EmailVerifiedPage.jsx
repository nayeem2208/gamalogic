import React, { useEffect } from "react";
import { GoVerified } from "react-icons/go";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserState } from "../context/userContext";

function EmailVerifiedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = new URLSearchParams(location.search).get("confirm");
  let { setUserDetails} = useUserState();

  const handleVerify = () => {
    const storedToken = localStorage.getItem("Gamalogic_token");
    if (storedToken && confirm) {
      let token;
      try {
        token = JSON.parse(storedToken);
      } catch (error) {
        token = storedToken;
      }
      token.confirm = 1;
      localStorage.setItem("Gamalogic_token", JSON.stringify(token));
      setUserDetails(token);
    }
    navigate("/");
  };
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center text-white">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        </Link>
      </div>
      <div className="extra-page">
        <div className="text-center auth " style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl">Welcome To Gamalogic</h2>
          <p className="my-12 description">Thanks for signing up!</p>
          <div className="flex justify-center">
            <GoVerified
              style={{ fontSize: "15vw" }}
              className="font-extralight text-cyan-500 "
            />
          </div>
        </div>
        <div className="verify-foot-p my-6">
        <p className="description font-thin text-center text-sm md:text-base">
        Use our Cutting-Edge AI technology to verify your Email Address.
          </p>
          <div className="my-6 flex justify-center">
          <button
              onClick={handleVerify}
              className="bg-red-500 rounded-lg py-2 font-semibold px-4 "
            >
              START VERIFYING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerifiedPage;
