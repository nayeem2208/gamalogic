import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { useUserState } from "../../context/userContext";

function ViewMoreDetails({ data, onDownloadFile }) {
  const { userDetails } = useUserState();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (
      chartRef.current &&
      data.count_disposable &&
      data.count_deliverable &&
      data.count_not_valid &&
      data.count_catchall &&
      data.count_unknown
    ) {
      // Destroy previous chart instance if exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const total = Object.values({
        disposable: data.count_disposable,
        deliverable: data.count_deliverable,
        notValid: data.count_not_valid,
        catchAll: data.count_catchall,
        unknown: data.count_unknown,
      }).reduce((sum, count) => sum + parseInt(count || 0), 0);

      const ctx = chartRef.current.getContext("2d");

      // Prepare counts array
      const counts = [
        data.count_disposable,
        data.count_deliverable,
        data.count_not_valid,
        data.count_catchall,
        data.count_unknown,
      ];

      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: [
            "Disposable",
            "Deliverable",
            "Not Valid",
            "Catch All",
            "Unknown",
          ],
          datasets: [
            {
              data: [
                total ? Math.round((data.count_disposable / total) * 100) : 0,
                total ? Math.round((data.count_deliverable / total) * 100) : 0,
                total ? Math.round((data.count_not_valid / total) * 100) : 0,
                total ? Math.round((data.count_catchall / total) * 100) : 0,
                total ? Math.round((data.count_unknown / total) * 100) : 0,
              ],
              // Add counts as a custom property
              counts: counts,
              backgroundColor: [
                "#e09860", // Light Orange (Disposable)
                "#4fb04d", // Green (Deliverable)
                "#d45555", // Red (Not Valid)
                "#eddb72", // Yellow (Catch All)
                "#9E9E9E", // Grey (Unknown)
              ],
              borderWidth: 0.5,
            },
          ],
        },
        options: {
          cutout: "65%",
          plugins: {
            legend: {
              position: "left",
              labels: {
                boxWidth: 15,
                padding: 20,
                font: {
                  size: 12,
                },
                generateLabels: (chart) => {
                  const data = chart.data;
                  const dataset = data.datasets[0];
                  return data.labels.map((label, i) => ({
                    text: `${label}: ${dataset.data[i]}% (${dataset.counts[i]} emails)`,
                    fillStyle: dataset.backgroundColor[i],
                    hidden: false,
                    lineWidth: 0,
                    strokeStyle: "transparent",
                  }));
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.label.toLowerCase().replace(" ", "");
                  if (context.label === "Not Valid") label = "not_valid";
                  const count = data[`count_${label}`];
                  return `${context.label}: ${context.raw}% (${count} emails)`;
                },
              },
            },
          },
          layout: {
            padding: {
              left: 0,
              right: 20,
            },
          },
          maintainAspectRatio: false,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  const shouldShowChart =
    data.count_disposable &&
    data.count_deliverable &&
    data.count_not_valid &&
    data.count_catchall &&
    data.count_unknown;

  return (
    <div className="text-center sm:text-left w-full min-w-[96] mb-4 h-full">
      <div
        className="container px-8 py-2 mt-2 shadow rounded-lg w-full 2xl:w-10/12 text-blue-950"
        style={{
          background:
            "linear-gradient(0deg, rgba(239,240,255,1) 0%, rgba(155,163,215,0.3) 100%)",
        }}
      >
        <div className=" my-2">
          <p className={`text-base md:text-lg font-semibold hidden sm:block mt-5 ${shouldShowChart?'ml-0':'mx-3'}`}>
            {data.file_upload}
          </p>
          <div className={`${!shouldShowChart?'sm:flex':'lg:flex'} justify-evenly items-center `}>
            <div className="flex flex-col justify-center h-full text-xs md:text-[13px] items-center sm:items-start w-full gap-3 my-3 lg:w-5/6 max-h-72 overflow-y-auto">
              <div className="w-4/5 overflow-hidden block sm:hidden">
                <div
                  className={`singleTileHeading text-center text-sm 2xl:text-lg font-semibold ${
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

              <div className="w-24 flex flex-col sm:hidden justify-center items-center">
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
              <p className="text-left">
                <strong>Date:</strong>{" "}
                {data.formattedDate?.includes(",")
                  ? data.formattedDate?.split(",")[0].trim()
                  : data.formattedDate?.split(" ")[0].trim()}
                <strong className="ml-4">Time:</strong>{" "}
                {data.formattedDate?.includes(",")
                  ? data.formattedDate?.split(",")[1]?.trim()
                  : data.formattedDate?.split(" ")[1]?.trim()}
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
              {data.resolved_time && (
                <p>
                  <strong>Resolved Time:</strong> {data.resolved_time}
                </p>
              )}
              <div
                className="SingleTileDownload w-full flex justify-center sm:justify-normal items-center"
                onClick={() => onDownloadFile(data)}
              >
                <button className="w-56 flex justify-center items-center">
                  <span className="transition"></span>
                  <span className="gradient"></span>
                  <span className="label flex justify-center items-center font-sm font-semibold rounded-md mt-4">
                    DOWNLOAD
                    <IoArrowDownCircleOutline className="w-6 h-6 ml-1" />
                  </span>
                </button>
              </div>
            </div>
            {!shouldShowChart ? (
              <div className="w-28  lg:w-32 hidden sm:flex flex-col justify-center items-center">
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
            ) : (
              <div className="hidden sm:flex w-full h-48 items-center justify-between">
                <div className="w-full flex justify-center">
                  <canvas 
                    ref={chartRef} 
                    width={200}
                    height={200}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewMoreDetails;