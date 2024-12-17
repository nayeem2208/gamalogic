import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { useUserState } from "../../context/userContext";

function ViewMoreDetails({ data, onDownloadFile }) {
  let { userDetails } = useUserState();
    // console.log(data,'data ot view')

  return (
    <div className=" text-center sm:text-left w-full min-w-[96] mb-4">
      <div
        className="container px-8 py-2 mt-2 shadow rounded-lg  w-full 2xl:w-10/12 text-blue-950"
        style={{
          background:
            "linear-gradient(0deg, rgba(239,240,255,1) 0%, rgba(155,163,215,0.3) 100%)",
        }}
      >
        <div className="flex  justify-evenly items-center    my-2">
          <div className="flex flex-col justify-center h-full text-xs md:text-[13px] items-start w-full gap-3 my-3  lg:w-5/6 max-h-72 overflow-y-auto">
            <p className="text-base md:text-lg font-semibold ">{data.file_upload}</p>

            {/* <p>
              <strong>Status:</strong> Complete
            </p> */}
            <p>
              <strong>Date:</strong>{" "}
              {data.formattedDate?.includes(",")
                ? data.formattedDate.split(",")[0].trim()
                : data.formattedDate.split(" ")[0].trim()}
              <strong className="ml-4">Time:</strong>{" "}
              {data.formattedDate.includes(",")
                ? data.formattedDate.split(",")[1]?.trim()
                : data.formattedDate.split(" ")[1]?.trim()}
            </p>
            {userDetails.isTeam == 1 && (
              <p>
                <strong>Uploaded By:</strong>{" "}
                {data.team_member_emailid || "You"}
              </p>
            )}
            <p>
              <strong>Count:</strong> {data.count}
            </p>
           {data.resolved_time&& <p>
              <strong>Resolved Time:</strong> {data.resolved_time}
            </p>}
            <div
              className="SingleTileDownload w-full flex   items-center  "
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
          <div className="w-28 lg:w-32  flex flex-col  justify-center items-center   ">
            <CircularProgressbar
              value={data.processed}
              text={`${data.processed}%`}
              styles={buildStyles({
                textSize: "14px",
                textColor: "#4A4A4A",
                pathColor: `rgba(24, 32, 91)`,
                trailColor: "#d6d6d6",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewMoreDetails;
