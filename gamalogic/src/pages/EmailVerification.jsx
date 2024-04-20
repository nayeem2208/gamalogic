import SubHeader from "../components/SubHeader";
import axiosInstance from "../axios/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import exportFromJSON from "export-from-json";
import Papa from "papaparse";
import ProgressBar from "@ramonak/react-progress-bar";

function EmailVerification() {
  let [message, setMessage] = useState("");
  let [resultFile, setResultFile] = useState([]);
  let [loading,setLoading]=useState(false)

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        let allFiles = await axiosInstance.get(
          "/getAllUploadedEmailValidationFiles"
        );
        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        };
        const filesWithProcessedField = allFiles.data.map((file) => ({
          ...file,
          processed: 0,
          formattedDate: new Date(file.date_time).toLocaleString(
            "en-US",
            options
          ),
        }));
        const allProcessed = filesWithProcessedField.every(
          (file) => file.processed === 100
        );
        if (!allProcessed) {
          setResultFile((prevResultFiles) => [
            ...prevResultFiles,
            ...filesWithProcessedField,
          ]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllFiles();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      try {
        Papa.parse(file, {
          header: true,
          complete: async function (results) {
            results.fileName = file.name;
            setLoading(true)
            const response = await axiosInstance.post(
              "/batchEmailVerification",
              results
            );
            setLoading(false)
            setMessage(response.data.message);
            const options = {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            };
            setResultFile((prevResultFiles) => [
              {
                ...response.data.files,
                processed: 0,
                formattedDate: new Date(
                  response.data.files.date_time
                ).toLocaleString("en-US", options),
              },
              ...prevResultFiles,
            ]);
          },
        });
      } catch (error) {
        setLoading(false)
        console.error("Error uploading file:", error);
      }
    } else {
      alert("Please select a CSV file.");
    }
  };
  console.log(resultFile, "resultfile");
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        for (const [index, file] of resultFile.entries()) {
          if (file.id && file.processed !== 100) {
            const res = await axiosInstance.get(
              `/getBatchStatus?id=${file.id}`
            );
            if (res.data.emailStatus.processed === res.data.emailStatus.total) {
              setResultFile((prevResultFiles) => [
                ...prevResultFiles.slice(0, index),
                { ...file, processed: 100 },
                ...prevResultFiles.slice(index + 1),
              ]);
              setMessage("");
            } else {
              const progress = Math.round(
                (res.data.emailStatus.processed / res.data.emailStatus.total) *
                  100
              );
              setResultFile((prevResultFiles) => [
                ...prevResultFiles.slice(0, index),
                { ...file, processed: progress },
                ...prevResultFiles.slice(index + 1),
              ]);
              setTimeout(checkCompletion, 5000);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkCompletion();
  }, [resultFile]);

  const DownloadFile = async (data) => {
    try {
      console.log(data, "data is here");
      if (data.processed == 100) {
        let res = await axiosInstance.get(
          `/downloadEmailVerificationFile?batchId=${data.id}`
        );
        console.log(res.data.gamalogic_emailid_vrfy, "ressssssssssss");
        const csvData = res.data.gamalogic_emailid_vrfy;
        const fileName = "Verified Emails";
        const exportType = exportFromJSON.types.csv;
        exportFromJSON({ data: csvData, fileName, exportType });
      } else {
        toast.error(
          `Oops! It looks like the processing isn't complete yet. Please wait until it reaches 100% before downloading.`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Upload your file"} />
      <form className="mt-14 subHeading">
        <h3>Upload Your File Here | Email Validation</h3>
        <p className="my-7 w-4/5 description">
          You can upload the email address list in csv file and get results in
          csv. Select a file to upload.
        </p>
        <input
          type="file"
          className="text-sm"
          accept=".csv"
          onChange={handleFileChange}
        />
      </form>
      {loading&&<div
        className="mt-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>}
      <p className="bg-cyan-400 font-semibold my-4 ">{message}</p>
      <table className="text-bgblue w-full lg:w-4/5 mt-14 ">
        <tr className="text-left">
          <th className="font-normal w-1/5">File Name</th>
          <th className="font-normal  w-2/5">Status</th>
          <th className="font-normal  w-1/5">Upload Time</th>
          <th></th>
        </tr>
        {resultFile.map((data, index) => (
          <tr key={index} className="text-sm">
            <td className="">{data.file}</td>
            <td className="flex ">
              <ProgressBar
                isLabelVisible={false}
                completed={data.processed}
                bgColor="#181e4a"
                labelSize="13px"
                className="w-2/5 mr-2"
                maxCompleted={100}
              />
              {data.processed}%
            </td>
            <td>{data.formattedDate}</td>
            <td className="flex justify-center items-center ">
              <button
                className="bg-bgblue text-white py-1 px-4 rounded-md ml-2   h-9 mt-8 text-xs"
                onClick={() => DownloadFile(data)}
              >
                DOWNLOAD
              </button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default EmailVerification;
