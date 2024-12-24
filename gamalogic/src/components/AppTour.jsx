import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";
import { useUserState } from "../context/userContext";
import axiosInstance from "../axios/axiosInstance";

function CustomTooltip(props) {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
  } = props;

  return (
    <div
      className="rounded-xl  ml-10"
      {...tooltipProps}
      style={{
        background:
          "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
        color: "#010B25",
      }}
    >
      <div className="px-5 py-6 shadow-md   ">
        {step.title && (
          <h4 className="tooltip__title text-lg font-semibold mb-2">
            {step.title}
          </h4>
        )}
        <div className="tooltip__content text-[13px]">{step.content}</div>
      </div>
      <div className="tooltip__footer  flex justify-between shadow-inner px-6  py-2 ">
        <button
          className="tooltip__button font-semibold text-sm text-bgblue hover:text-blue-800"
          {...skipProps}
        >
          {skipProps.title}
        </button>
        <div className="tooltip__spacer flex justify-end ">
          {continuous && (
            <div className="SingleTileDownload w-36 flex justify-end">
              <button
                className=" w-36 h-8 flex justify-center items-center"
                {...primaryProps}
              >
                <span className="transition"></span>
                <span className="gradient"></span>
                <span className="label flex  justify-center items-center font-sm  font-semibold rounded-md mt-4">
                  {" "}
                  {primaryProps.title}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const AppTour = () => {
  const [run, setRun] = useState(false);

  let { appTour, setAppTour } = useUserState();

  useEffect(() => {
    if (appTour.showTour && !run) {
      setRun(true);
    }
  }, [appTour, run]);

  const steps = [
    {
      target: ".email-validation-step",
      title: "Email Validation",
      content: (
        <div>
          <p>Click this menu to validate any email address</p>
          {/* <button className="text-red-500 mt-3 font-semibold  w-full">
            Please click on the Quick Validation Tab to go forward
          </button> */}
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".email-finder-step",
      title: "Email Finder",
      content: (
        <div>
          <p>Click this menu to find email address</p>
          {/* <button className="text-red-500 mt-3 font-semibold  w-full">
            Please click on the Email Finder Tab to go forward
          </button> */}
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".file-validation-step",
      title: "File upload Email Validation",
      content: <p>Click here to upload file with email address to validate</p>,
      disableBeacon: true,
    },
    {
      target: ".large-set-finder-step",
      title: "File upload Email finder",
      content: (
        <p>
          Click here to upload file with name and company url to find email
          address
        </p>
      ),
      disableBeacon: true,
    },
  ];

  useEffect(() => {
    const checkTargets = () => {
      const allTargetsPresent = steps.every((step) =>
        document.querySelector(step.target)
      );
      if (allTargetsPresent) {
        setRun(true);
      }
    };

    const timeout = setTimeout(checkTargets, 500);
    return () => clearTimeout(timeout);
  }, [steps]);

  const handleTourCallback = async (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false);
      setAppTour(null);
      const storedToken = localStorage.getItem("Gamalogic_token");
      if (storedToken) {
        let token;
        try {
          token = JSON.parse(storedToken);
        } catch (error) {
          token = storedToken;
        }
        token.AppTour = null;
        localStorage.setItem("Gamalogic_token", JSON.stringify(token));
      }
      await axiosInstance.get('/appTourUpdation')
    }
  };

  return (
    <div>
      <Joyride
        steps={steps}
        run={run}
        tooltipComponent={CustomTooltip}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        disableScrolling
        disableBeacon
        disableCloseOnEsc
        disableOverlayClose
        placement="top-end"
        spotlightClicks
        callback={handleTourCallback}
        styles={{
          options: {
            zIndex: 100,
            arrowColor: "#e1e3f0",
            backgroundColor: "#e3f5ff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            primaryColor: "#ff3636",
            textColor: "#0f0f0f",
            width: 500,
          },
          spotlight: {
            border: "0.5px #22d3ee solid",
            boxShadow: "0 0 15px 5px rgba(34, 211, 238, 0.5)",
            transition: "all 0.3s ease-in-out",
          },
        }}
      />
    </div>
  );
};

export default AppTour;
