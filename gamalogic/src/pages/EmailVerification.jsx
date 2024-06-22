import SubHeader from "../components/SubHeader";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import exportFromJSON from "export-from-json";
import Papa from "papaparse";
import ProgressBar from "@ramonak/react-progress-bar";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";
import { IoDownload } from "react-icons/io5";
import { json } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import clickUpAttachment from "../utils/clickup";

function EmailVerification() {
  let [message, setMessage] = useState("");
  let [resultFile, setResultFile] = useState([]);
  let [loading, setLoading] = useState(false);
  const [filesStatus, setFilesStatus] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [JsonToServer, setJsonToServer] = useState({});
  let [load, setLoad] = useState(30);
  let [serverError, setServerError] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fileForClickUp, setFileForClickUp] = useState();


  const isCheckingCompletion = useRef(false);
  let { userDetails, setCreditBal, creditBal } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Batch Email Verification | Beta Dashboard";
    } else {
      document.title = "Batch Email Verification | Dashboard";
    }
    fetchAllFiles(pageIndex);
  }, []);

  const fetchAllFiles = async (newPageIndex) => {
    try {
      setLoading(true);
      const allFiles = await axiosInstance.get(
        `/getAllUploadedEmailValidationFiles?page=${newPageIndex}`
      );
      setLoad(100);
      if (allFiles.data.length === 0) {
        setHasMore(false);
      } else {
        const formatDate = (dateTimeString) => {
          console.log(dateTimeString, typeof dateTimeString, "hiiiii");

          // Split the string into date and time components
          const [dateString, timeString] = dateTimeString.split("T");
          console.log(dateString, timeString, "date and time ");
          // Split the date string further
          const [year, month, day] = dateString.split("-");

          // Split the time string further
          const [hours, minutes, seconds] = timeString.split(":");

          // Format the month with leading zero (optional)
          const formattedMonth = String(parseInt(month)).padStart(2, "0"); // Months are zero-indexed

          // Format the date and time in the desired format
          return `${formattedMonth}/${day}/${year}, ${hours}:${minutes}`;
        };
        const filesWithProcessedField = allFiles.data.map((file) => ({
          ...file,
          processed: 0,
          formattedDate: formatDate(file.date_time),
        }));

        setResultFile((prevResultFiles) => [
          ...prevResultFiles,
          ...filesWithProcessedField,
        ]);
        setFilesStatus((prevFilesStatus) => [
          ...prevFilesStatus,
          ...filesWithProcessedField,
        ]);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };

  const fetchMoreFiles = async () => {
    setPageIndex((prevPageIndex) => {
      const newPageIndex = prevPageIndex + 1;
      fetchAllFiles(newPageIndex);
      return newPageIndex;
    });
  };

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
              let adjustedProgress;
              if (res.data.emailStatus.total > 2000) {
                adjustedProgress = progress;
              } else {
                adjustedProgress = Math.floor(progress / 5) * 5;
              }
              // const adjustedProgress = Math.floor(progress / 5) * 5;
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

    const intervalId = setInterval(checkCompletion, 10000);
    return () => clearInterval(intervalId);
  }, [filesStatus]);

  const DownloadFile = async (data) => {
    try {
      console.log(data, "data is here");
      if (data.processed == 100) {
        setLoading(true);
        setLoad(30);
        let res = await axiosInstance.get(
          `/downloadEmailVerificationFile?batchId=${data.id}`
        );
        setLoad(100);
        const outputArray = res.data.datas.gamalogic_emailid_vrfy
          .filter((obj) => obj.emailid !== "emailid")
          .map((obj) => {
            let status = "";
            if (obj.is_catchall) {
              status = "Catchall";
            } else if (obj.is_unknown) {
              status = "Unknown";
            } else if (obj.is_valid) {
              status = "Valid Address";
            } else {
              status = "Not Valid Address";
            }

            return {
              emailid: obj.emailid,
              status: status,
            };
          });
          const csvData = outputArray;
          const fileName = res.data.fileName;
          const dateOfUpload = res.data.dateOfUpload;
  
  
          const parts = fileName.split(".");
          const nameWithoutExtension = parts[0];
  
          const uploadDate = new Date(dateOfUpload);
          const year = uploadDate.getFullYear(); 
          const month = ("0" + (uploadDate.getMonth() + 1)).slice(-2); 
          const day = ("0" + uploadDate.getDate()).slice(-2);
  
          const finalFileName = `${nameWithoutExtension}_${year}-${month}-${day}`;
  
          const exportType = exportFromJSON.types.csv;
          exportFromJSON({ data: csvData,fileName: finalFileName, exportType });
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
    if (userDetails.confirm == 1) {
      if (file && file.type === "text/csv") {
        try {
          setFileForClickUp(file);
          Papa.parse(file, {
            // header: true,
            complete: async function (results) {
              const emails = results.data
                .filter((emailArray) => emailArray[0] !== "emailid")
                .map((emailArray) => {
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
                toast.error(
                  "Please select a file with not more than 100,000 email address"
                );
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
    } else {
      toast.error("Please verify your email");
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      if (JsonToServer.emails.length <= creditBal) {
        setLoading(true);
        setLoad(30);
        setShowAlert(false);
        let results = JsonToServer;
        const response = await axiosInstance.post(
          "/batchEmailVerification",
          results
        );
        if ((response.status, "response.statusssssssssssssss"))
          console.log(response, "responseeeeeeeeeeee");
        setLoad(100);
        setCreditBal(creditBal - JsonToServer.emails.length);
        setMessage(response.data.message);
        toast.success(response.data.message);
        const formatDate = (dateTimeString) => {
          console.log(dateTimeString, typeof dateTimeString, "hiiiii");

          // Split the string into date and time components
          const [dateString, timeString] = dateTimeString.split("T");
          console.log(dateString, timeString, "date and time ");
          // Split the date string further
          const [year, month, day] = dateString.split("-");

          // Split the time string further
          const [hours, minutes, seconds] = timeString.split(":");

          // Format the month with leading zero (optional)
          const formattedMonth = String(parseInt(month) ).padStart(2, "0"); // Months are zero-indexed

          // Format the date and time in the desired format
          return `${formattedMonth}/${day}/${year}, ${hours}:${minutes}`;
        };
        setResultFile((prevResultFiles) => [
          {
            ...response.data.files,
            processed: 0,
            formattedDate: formatDate(response.data.files.date_time),
          },
          ...prevResultFiles,
        ]);
        setFilesStatus((prevResultFiles) => [
          {
            ...response.data.files,
            processed: 0,
            formattedDate: formatDate(response.data.files.date_time),
          },
          ...prevResultFiles,
        ]);
      } else {
        setShowAlert(false);
        toast.error("You dont have enough credits to do this");
      }
    } catch (error) {
      if (error.response.status === 500) {
        async function errorHandler() {
          let res = await clickUpAttachment(
            fileForClickUp,
            error.response.data.errorREsponse.id
          );
        }
        errorHandler();
        setServerError(true);
      } else if (error.response.status === 400 && errorREsponse) {
        async function errorHandler() {
          let res = await clickUpAttachment(
            fileForClickUp,
            error.response.data.errorREsponse.id
          );
        }
        errorHandler();
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
    <div className=" px-6 md:px-20 py-8 text-center sm:text-left">
      <SubHeader SubHeader={"Upload your file"} />
      <form className="mt-8 sm:mt-14 subHeading flex flex-col sm:flex-none justify-center items-center sm:justify-start sm:items-start">
        <h3>Upload Your File Here | Email Validation</h3>
        <p className="my-7  description">
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
          className="flex h-9 shadow-lg text-white rounded-lg font-semibold  border border-input bg-red-600 hover:bg-red-800 bg-background px-3 py-1 text-sm  transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground file:shadow-xl file:bg-red-900 hover:file:bg-red-600 file:rounded-lg file:px-4 file:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 "
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

      <div className="overflow-x-auto">
        <InfiniteScroll
          dataLength={resultFile.length}
          next={fetchMoreFiles}
          hasMore={hasMore}
          height={300}
          loader={
            resultFile.length >= 4 && (
              <div className="w-full mt-4  flex justify-center items-center">
                <div
                  className="mt-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              </div>
            )
          }
          // endMessage={<p className="text-xs">No more data to load.</p>}
        >
          <table
            className="text-bgblue w-full  mt-14 min-w-96"
            style={{ fontFamily: "Raleway,sans-serif" }}
          >
            <tbody>
              <tr className="sm:text-left text-xs sm:text-sm">
                <th className="font-normal  md:w-1/5">File Name</th>
                <th className="font-normal  md:w-2/5 ">Status</th>
                <th className="font-normal  md:w-1/5">Upload Time</th>
                <th></th>
              </tr>
              {resultFile.map((data, index) => (
                <tr key={index} className="text-xs sm:text-sm">
                  <td className="md:pt-5">{data.file_upload}</td>
                  <td className="flex ">
                    <ProgressBar
                      isLabelVisible={false}
                      completed={data.processed}
                      bgColor="#181e4a"
                      labelSize="13px"
                      className="md:w-2/5 mr-2"
                      maxCompleted={100}
                    />
                    {data.processed}%
                  </td>
                  <td className="md:pt-5">{data.formattedDate}</td>
                  <td className="flex justify-center items-center ">
                    <div className="sm:hidden">
                      <IoDownload
                        className="text-xl"
                        onClick={() => DownloadFile(data)}
                      />
                    </div>
                    <div className="hidden sm:block">
                      <button
                        className="bg-bgblue text-white py-1 px-4 rounded-md ml-2 h-9 mt-8 text-xs"
                        onClick={() => DownloadFile(data)}
                      >
                        DOWNLOAD
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default EmailVerification;
