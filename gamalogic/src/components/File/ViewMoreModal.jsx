import React, { useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Pie, PolarArea } from "react-chartjs-2"; // Import PolarArea
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js"; // Import RadialLinearScale
import { IoArrowDownCircleOutline } from "react-icons/io5";

// Register the necessary components, including RadialLinearScale
ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

function ViewMoreModal({ data, onClose,selectDownloadFile }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  const pieData = {
    labels: ["Red", "Green", "Yellow", "Grey", "Blue"],
    datasets: [
      {
        label: "My First Dataset",
        data: [11, 16, 7, 3, 14],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(201, 203, 207)",
          "rgb(54, 162, 235)",
        ],
      },
    ],
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
        onClick={handleClickOutside}
      ></div>

      <div
        ref={modalRef}
        role="alert"
        className="fixed  rounded-lg px-6 border p-6 shadow-xl z-50 text-blue-950"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "1200px",
          maxHeight: "80%",
          background:
            "linear-gradient(0deg, rgba(255,255,255) 0%, rgba(225,227,240) 100%)",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="w-4/6 ">
            <p className="text-2xl font-medium ">{data.file_upload}</p>
          </div>
          <button className="text-red-500 font-bold" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Flexbox for placing progress bar and chart in the same row */}
        <div className=" flex flex-col lg:flex-row  justify-between items-center w-full mb-4 ">
          <div className="flex flex-col text-sm items-start w-full gap-4 my-3 lg:w-2/6 max-h-72 overflow-y-auto">
            <p>
              <strong>Status:</strong> Complete
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {data.formattedDate?.includes(",")
                ? data.formattedDate.split(",")[0].trim()
                : data.formattedDate.split(" ")[0].trim()}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {data.formattedDate.includes(",")
                ? data.formattedDate.split(",")[1]?.trim()
                : data.formattedDate.split(" ")[1]?.trim()}
            </p>
            <p>
              <strong>Uploaded By:</strong> {data.team_member_emailid || "You"}
            </p>
            <p>
              <strong>Time Taken:</strong> {data.timeTaken} minutes
            </p>
            <p>
              <strong>File Size:</strong> 100 MB
            </p>
          </div>
          <div className="w-2/5 lg:w-1/5 ">
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
          <div className="w-full lg:w-2/6 flex flex-col justify-center items-center ">
            <h3 className="font-bold text-gray-700 text-center ">
              Email Statistics
            </h3>
            <div
              style={{ width: "90%" }}
              className=" h-72  flex justify-center items-center"
            >
              <PolarArea data={pieData} />
            </div>
          </div>
        </div>
        <div className="SingleTile  w-64" onClick={selectDownloadFile}>
          <button className="w-4/5 flex justify-center items-center">
            <span className="transition"></span>
            <span className="gradient"></span>
            <span className="label flex  justify-center items-center  font-semibold rounded-md mt-5">
              DOWNLOAD
              <IoArrowDownCircleOutline className="w-6 h-6 ml-1" />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default ViewMoreModal;
