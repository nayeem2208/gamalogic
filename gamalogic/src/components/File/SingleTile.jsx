import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { SlCalender } from "react-icons/sl";
import { FiClock } from "react-icons/fi";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { useUserState } from "../../context/userContext";


function SingleTile({ data, onDownloadFile, onViewMoreDetails }) {
  let { userDetails } = useUserState();

  return (
    <div
      className="SingleTileForFile shadow-lg  hover:shadow-2xl flex flex-col  max-w-72   2xl:w-72 2xl:max-w-72 items-center rounded-2xl py-5 lg:pt-5 lg:pb-5 ml-0 mr-12 m-6"
      style={{
        background:
          "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
      }}
    >
      <div
        className="relative w-full overflow-hidden mb-3"
        style={{
          height: "1.5rem",
        }}
      >
        <div
          className={`singleTileHeading text-center 2xl:text-lg font-semibold  ${
            data.file_upload.length > 25 ? "scroll-animation" : ""
          }`}
          title={data.file_upload}
          style={{
            color: "rgba(24, 32, 91)",
            whiteSpace: "nowrap",
            zIndex: "10",
          }}
        >
          {data.file_upload}
        </div>
      </div>

      <div className="singleTileProgress flex justify-center items-center my-2  lg:w-3/6 2xl:w-3/5 ">
        <CircularProgressbar
          value={data.processed}
          text={`${data.processed}%`}
          styles={buildStyles({
            textSize: "13px",
            fontWeight: "500",
            textColor: "#363636",
            pathColor: `rgba(24, 32, 91)`,
            trailColor: "#d6d6d6",
          })}
        />
      </div>
      <div
        className="singleTileDateAndTime flex justify-between  font-medium w-5/6 2xl:w-4/6 my-2 "
        style={{ color: "#131942" }}
      >
        <div className=" flex items-center text-blue-950">
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
      {userDetails.isTeam == 1 ? (
        <div className="singleTileUploadedBy relative w-full  overflow-hidden text-xs font-medium  text-bgblue opacity-50  ">
          <div
            className={`text-center  ${
              (data.team_member_emailid || "").length > 20
                ? "scroll-animation"
                : ""
            }`}
            title={data.team_member_emailid}
            style={{
              whiteSpace: "nowrap",
            }}
          >
            Uploaded By:
            {data.team_member_emailid || "You"}
          </div>
        </div>
      ) : (
        <div className="singleTileUploadedBy relative w-full  overflow-hidden text-xs font-medium  text-bgblue opacity-50  ">
          <div
            className={`text-center  ${
              (data.team_member_emailid || "").length > 20
                ? "scroll-animation"
                : ""
            }`}
            title={data.team_member_emailid}
            style={{
              whiteSpace: "nowrap",
            }}
          >
            {" "}
          </div>
        </div>
      )}
      <div
        className="SingleTileDownload w-full flex justify-center items-center mt-3 px-2"
        onClick={() => onDownloadFile(data)}
      >
        <button className="w-56 flex justify-center items-center">
          <span className="transition"></span>
          <span className="gradient"></span>
          <span className="label flex  justify-center items-center font-sm  font-semibold rounded-md mt-4">
            DOWNLOAD
            <IoArrowDownCircleOutline className="w-6 h-6 ml-1" />
          </span>
        </button>
      </div>
    </div>
  );
}

export default SingleTile;
