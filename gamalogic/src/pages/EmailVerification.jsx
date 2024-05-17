import SubHeader from "../components/SubHeader";
import axiosInstance from "../axios/axiosInstance";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import exportFromJSON from "export-from-json";
import Papa from "papaparse";
import ProgressBar from "@ramonak/react-progress-bar";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";

function EmailVerification() {
  let [message, setMessage] = useState("");
  let [resultFile, setResultFile] = useState([]);
  let [loading, setLoading] = useState(false);
  const [filesStatus, setFilesStatus] = useState([]);
  const isCheckingCompletion = useRef(false);
  const [showAlert, setShowAlert] = useState(false);
  const [JsonToServer, setJsonToServer] = useState({});
  let [load, setLoad] = useState(30);
  let [serverError, setServerError] = useState(false);

  let { creditBal } = useUserState();

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        setLoading(true)
        let allFiles = await axiosInstance.get(
          "/getAllUploadedEmailValidationFiles"
        );
        setLoad(100);
        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
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
        setFilesStatus((prevResultFiles) => [
          ...prevResultFiles,
          ...filesWithProcessedField,
        ]);
      } catch (error) {
        if (error.response.status === 500) {
          setServerError(true); 
        } else {
          toast.error(error.response?.data?.error);
        }
      }
    };
    document.title='Batch Email Verification'
    fetchAllFiles();
  }, []);

  useEffect(() => {
    if (filesStatus.length === 0 || isCheckingCompletion.current) return;
    isCheckingCompletion.current = true;

    const checkCompletion = async () => {
      try {
        for (const file of filesStatus) {
          if (file.id && file.processed !== 100) {
            const res = await axiosInstance.get(
              `/getBatchStatus?id=${file.id}`
            );
            if (res.data.emailStatus.status === "completed") {
              setFilesStatus((prevFilesStatus) =>
                prevFilesStatus.filter((prevFile) => prevFile.id !== file.id)
              );
              setResultFile((prevResultFiles) =>
                prevResultFiles.map((prevFile) =>
                  prevFile.id === file.id
                    ? { ...prevFile, processed: 100 }
                    : prevFile
                )
              );
              setMessage("");
            } else {
              const progress = Math.round(
                (res.data.emailStatus.processed / res.data.emailStatus.total) *
                  100
              );
              const adjustedProgress = Math.floor(progress / 10) * 10;
              if (file.processed !== adjustedProgress) {
                setFilesStatus((prevFilesStatus) =>
                  prevFilesStatus.map((prevFile) =>
                    prevFile.id === file.id
                      ? { ...prevFile, processed: adjustedProgress }
                      : prevFile
                  )
                );
                setResultFile((prevResultFiles) =>
                  prevResultFiles.map((prevFile) =>
                    prevFile.id === file.id
                      ? { ...prevFile, processed: adjustedProgress }
                      : prevFile
                  )
                );
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        isCheckingCompletion.current = false;
      }
    };

    checkCompletion();

    const intervalId = setInterval(checkCompletion, 20000);
    return () => clearInterval(intervalId);
  }, [filesStatus]);

  const DownloadFile = async (data) => {
    try {
      console.log(data, "data is here");
      if (data.processed == 100) {
        setLoading(true);
        setLoad(30)
        let res = await axiosInstance.get(
          `/downloadEmailVerificationFile?batchId=${data.id}`
        );
        setLoad(100);
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
      if (error.response.status === 500) {
        setServerError(true); 
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      try {
        Papa.parse(file, {
          // header: true,
          complete: async function (results) {
            const emails = results.data.map((emailArray) => {
              return { emailid: emailArray[0] };
            });
            const fileName = file.name;
            if (emails.length <= 100001) {
              // if (creditBal >= emails.length-1) {
                setJsonToServer({ emails: emails, fileName: fileName });
                setShowAlert(true);
              // } else {
              //   toast.error("You dont have enough credits");
              // }
            } else {
              toast.error("Please select a file with not more than 100,000 email address");
            }
          },
        });
      } catch (error) {
        setLoading(false);
        console.error("Error uploading file:", error);
      }
    } else {
      alert("Please select a CSV file.");
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setLoad(30)
      setShowAlert(false);
      let results = JsonToServer;
      const response = await axiosInstance.post(
        "/batchEmailVerification",
        results
      );
      console.log(response, "responseeeeeeeeeeee");
      setLoad(100);
      setMessage(response.data.message);
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      setResultFile((prevResultFiles) => [
        {
          ...response.data.files,
          processed: 0,
          formattedDate: new Date(response.data.files.date_time).toLocaleString(
            "en-US",
            options
          ),
        },
        ...prevResultFiles,
      ]);
      setFilesStatus((prevResultFiles) => [
        {
          ...response.data.files,
          processed: 0,
          formattedDate: new Date(response.data.files.date_time).toLocaleString(
            "en-US",
            options
          ),
        },
        ...prevResultFiles,
      ]);
    } catch (error) {
      if (error.response.status === 500) {
        setServerError(true); 
      } else {
        toast.error(error.response?.data?.error);
      }
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };
  if (serverError) {
    return <ServerError />; 
  }
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Upload your file"} />
      <form className="mt-14 subHeading">
        <h3>Upload Your File Here | Email Validation</h3>
        <p className="my-7 w-4/5 description">
          You can upload the email address list in csv file and get results in
          csv. Select a file to upload.
        </p>
        {showAlert && (
          <div
            role="alert"
            className="mx-auto max-w-lg rounded-lg border border-stone bg-slate-200 p-4 shadow-xl sm:p-6 lg:p-8 absolute"
          >
            <div className="flex items-center gap-4">
              <span className="shrink-0 rounded-full bg-bgblue p-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>

              <p className="font-medium sm:text-lg text-red-500">
                New notification!
              </p>
            </div>

            <p className="mt-4 text-gray-600">
              Generating the data might take some time due to its size (
              {JsonToServer.emails.length} records). Are you sure you want to
              proceed?{" "}
            </p>

            <div className="mt-6 sm:flex sm:gap-4">
              <button
                className="inline-block w-full rounded-lg bg-bgblue px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
                onClick={handleAccept}
              >
                Accept
              </button>

              <button
                className="mt-2 inline-block w-full rounded-lg bg-stone-300 px-5 py-3 text-center text-sm font-semibold text-gray-800 sm:mt-0 sm:w-auto"
                onClick={handleDismiss}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <input
          type="file"
          className="flex h-9 shadow-lg text-white  rounded-md border border-input bg-slate-500 hover:bg-slate-700 bg-background px-3 py-1 text-sm  transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground file:shadow-lg file:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 "
          accept=".csv"
          onChange={handleFileChange}
        />
      </form>
      {loading && (
          <LoadingBar
            color="#f74c41"
            progress={load}
            onLoaderFinished={() => {}}
          />
        )}
      <p className="bg-cyan-400 font-semibold my-4 ">{message}</p>
      <table className="text-bgblue w-full  mt-14 ">
        <tbody>
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
        </tbody>
      </table>
    </div>
  );
}

export default EmailVerification;
