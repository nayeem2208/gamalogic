import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { SlCalender } from "react-icons/sl";
import { FiClock } from "react-icons/fi";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { useUserState } from "../../context/userContext";

function SingleTile({ data, onDownloadFile }) {
  let { userDetails } = useUserState();
  return (
    <div
      className="shadow-xl hover:shadow-2xl flex flex-col justify-center   max-w-72 md:w-64 md:max-w-64 lg:w-64 lg:max-w-64 2xl:w-72   2xl:max-w-72  items-center rounded-2xl py-4  lg:pt-8 lg:pb-5 m-6 "
      style={{
        background:
          "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
      }}
    >
      <h3
        className="font-semibold text-lg mb-6 w-3/4 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap"
        title={data.file_upload}
        style={{ color: "rgba(24, 32, 91)" }}
      >
        {data.file_upload}
      </h3>
      <div className="flex justify-center items-center w-2/5 lg:w-3/6 2xl:w-3/5">
        <CircularProgressbar
          value={data.processed}
          text={`${data.processed}%`}
          styles={buildStyles({
            textSize: "13px",
            fontWeight: "500",
            textColor: "#363636",
            pathColor: `rgba(24, 32, 91)`,
            trailColor: "#d6d6d6",
            // backgroundColor: "#3e98c7",
          })}
        />
      </div>
      <div
        className="flex justify-between font-medium w-5/6 2xl:w-4/6 my-4 text-sm"
        style={{ color: "#131942" }}
      >
        <div className="flex items-center">
          <SlCalender className="mr-2" />
          {data.formattedDate?.includes(",")
            ? data.formattedDate.split(",")[0].trim()
            : data.formattedDate.split(" ")[0].trim()}
        </div>
        <div className="flex items-center">
          <FiClock className="mr-2" />
          {data.formattedDate.includes(",")
            ? data.formattedDate.split(",")[1]?.trim()
            : data.formattedDate.split(" ")[1]?.trim()}
        </div>
      </div>
      {userDetails.isTeam == 1 && (
        <p
          title={data.team_member_emailid} // Tooltip for full email
          className="text-xs font-medium text-gray-500 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap w-full"
        >
          Uploaded By:{data.team_member_emailid || "You"}
        </p>
      )}
      <button
        style={{ backgroundColor: "#18205b" }}
        className="flex  justify-center items-center text-white font-semibold rounded-md w-52   py-2 mt-5"
        onClick={() => onDownloadFile(data)}
      >
        DOWNLOAD
        <IoArrowDownCircleOutline className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}

export default SingleTile;
