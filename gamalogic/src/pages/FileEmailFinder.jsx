import { useEffect, useRef, useState } from "react";
import SubHeader from "../components/SubHeader";
import Papa from "papaparse";
import exportFromJSON from "export-from-json";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import ProgressBar from "@ramonak/react-progress-bar";
import Alert from "../components/Alert";
import { useUserState } from "../context/userContext";

function FileEmailFinder() {
  let [message, setMessage] = useState("");
  let [resultFile, setResultFile] = useState([]);
  let [loading, setLoading] = useState(false);
  const [filesStatus, setFilesStatus] = useState([]);
  const isCheckingCompletion = useRef(false);
  const [showAlert, setShowAlert] = useState(false);
  const [Selection, SetSelection] = useState(null);
  const [JsonToServer, setJsonToServer] = useState([]);
  let { creditBal } = useUserState();

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        let allFiles = await axiosInstance.get(
          "/getAllUploadedEmailFinderFiles"
        );
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
            results.data = results.data.map((item) => {
              if (
                !Object.prototype.hasOwnProperty.call(item, "first_name") &&
                !Object.prototype.hasOwnProperty.call(item, "last_name") &&
                !Object.prototype.hasOwnProperty.call(item, "domain")
              ) {
                item = {
                  first_name: item.firstname,
                  last_name: item.lastname,
                  domain: item.url,
                };
              }
              return item;
            });
            if (results.data.length  <= 100000) {
              // if (creditBal >= (results.data.length-1 )* 10) {
                setJsonToServer(results);
                setShowAlert(true);
              // } else {
              //   toast.error("You dont have enough credits to do this");
              // }
            } else {
              toast.error("Please select a file with less than 1 lakh data");
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

  useEffect(() => {
    if (showAlert && Selection !== null) {
      if (Selection === true) {
        setShowAlert(false);
        setLoading(true);
        let results = JsonToServer;
        async function BatchFileFinder() {
          try {
            const response = await axiosInstance.post(
              "/batchEmailFinder",
              results
            );
            setLoading(false);
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
                formattedDate: new Date(
                  response.data.files.date_time
                ).toLocaleString("en-US", options),
              },
              ...prevResultFiles,
            ]);
            setFilesStatus((prevResultFiles) => [
              {
                ...response.data.files,
                processed: 0,
                formattedDate: new Date(
                  response.data.files.date_time
                ).toLocaleString("en-US", options),
              },
              ...prevResultFiles,
            ]);
          } catch (error) {
            toast.error(error.response.data?.error);
            setLoading(false);
          }
        }
        BatchFileFinder();
      } else {
        setShowAlert(false);
        setJsonToServer([]);
        SetSelection(null);
      }
    }
  }, [Selection]);

  // useEffect(() => {
  //   const checkCompletion = async () => {
  //     try {
  //       if (filesStatus.length > 0) {
  //         for (const [index, file] of filesStatus.entries()) {
  //           if (file.id && file.processed !== 100) {
  //             const res = await axiosInstance.get(
  //               `/getBatchFinderStatus?id=${file.id}`
  //             );
  //             if (res.data.emailStatus.processed === res.data.emailStatus.total) {
  //               // File completed, update filesStatus and resultFile
  //               setFilesStatus(prevFilesStatus => {
  //                 const updatedFilesStatus = [...prevFilesStatus];
  //                 updatedFilesStatus.splice(index, 1);
  //                 return updatedFilesStatus;
  //               });

  //               setResultFile(prevResultFiles => [
  //                 ...prevResultFiles.slice(0, index),
  //                 { ...file, processed: 100 },
  //                 ...prevResultFiles.slice(index + 1),
  //               ]);

  //               setMessage("");
  //             } else {
  //               const progress = Math.round(
  //                 (res.data.emailStatus.processed / res.data.emailStatus.total) * 100
  //               );
  //               // Update progress in filesStatus and resultFile
  //               setFilesStatus(prevFilesStatus => [
  //                 ...prevFilesStatus.slice(0, index),
  //                 { ...file, processed: progress },
  //                 ...prevFilesStatus.slice(index + 1),
  //               ]);

  //               setResultFile(prevResultFiles => [
  //                 ...prevResultFiles.slice(0, index),
  //                 { ...file, processed: progress },
  //                 ...prevResultFiles.slice(index + 1),
  //               ]);
  //               await new Promise(resolve => setTimeout(resolve, 10000));

  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   checkCompletion();
  // }, [resultFile,filesStatus]);
  useEffect(() => {
    if (filesStatus.length === 0 || isCheckingCompletion.current) return;
    isCheckingCompletion.current = true;

    const checkCompletion = async () => {
      try {
        for (const file of filesStatus) {
          if (file.id && file.processed !== 100) {
            const res = await axiosInstance.get(
              `/getBatchFinderStatus?id=${file.id}`
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
        // Reset the flag after completion check
        isCheckingCompletion.current = false;
      }
    };

    checkCompletion();

    const intervalId = setInterval(checkCompletion, 10000);
    return () => clearInterval(intervalId);
  }, [filesStatus]);

  const DownloadFile = async (data) => {
    try {
      console.log(data, "data is here");
      if (data.processed == 100) {
        let res = await axiosInstance.get(
          `/downloadEmailFinderFile?batchId=${data.id}`
        );
        console.log(res.data.gamalogic_emailid_vrfy, "ressssssssssss");
        const csvData = res.data.gamalogic_discovery;
        const fileName = "Emails Finder results";
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

  const handleAccept = (value) => {
    SetSelection(value);
  };

  const handleDismiss = (value) => {
    SetSelection(value);
    showAlert(false);
  };
  console.log(resultFile, "resultFile");
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Upload your file"} />
      {showAlert && (
        <Alert
          sizeOfData={JsonToServer}
          onAccept={handleAccept}
          onDismiss={handleDismiss}
        />
      )}
      <div className="mt-14 subHeading">
        <h3>Upload Your File Here | Email Finder</h3>
        <p className="my-7 w-4/5 description">
          You can upload the email address list in csv file and get results in
          csv. Download a sample file to upload here Select a file to upload.
        </p>
        <input
          type="file"
          className="text-sm"
          onChange={handleFileChange}
          accept=".csv"
        />
      </div>
      {loading && (
        <div
          className="mt-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      )}
      <p className="bg-cyan-400 font-semibold my-4 ">{message}</p>
      {resultFile.length > 0 && (
        <table className="text-bgblue w-full  mt-14 ">
          <tbody>
          <tr className="text-left">
            <th className="font-normal w-1/5">File Name</th>
            <th className="font-normal  w-2/5">Status</th>
            <th className="font-normal  w-1/5">Upload Time</th>
            <th className=""></th>
          </tr>
          {resultFile.map((data, index) => (
            <tr key={index} className="text-sm ">
              <td>{data.file}</td>
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
                  className="bg-bgblue text-white py-1 px-4 rounded-md ml-2 mt-4  h-9  text-xs"
                  onClick={() => DownloadFile(data)}
                >
                  DOWNLOAD
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FileEmailFinder;
