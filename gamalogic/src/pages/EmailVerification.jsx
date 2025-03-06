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
import { json, useLocation, useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import clickUpAttachment from "../utils/clickup";
import {
  handleCSVFile,
  handleTXTFile,
  handleXLSXFile,
} from "../utils/emailVerificationFile";
import * as XLSX from "xlsx";
import LinkedinLoading from "../components/LinkedinLoading";
import MoreFileLoader from "../components/MoreFileLoader";
import ViewSelector from "../components/File/ViewSelector";
import FileVerificationTile from "../components/File/FileVerificationTile";
import AddFileForFirstTime from "../components/File/AddFileForFirstTime";
import DragAndDropBackground from "../components/File/DragAndDropBackground";
import AddFileInRowView from "../components/File/AddFileInRowView";
import FileRowViewListing from "../components/File/FileRowView";
import ValidationSpreadsheet from "../components/EmailVerificationTable";

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
  const [realFile, setRealFile] = useState(null);
  let [tileView, setTileView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [spreadSheet, setSpreadSheet] = useState(false);

  const isCheckingCompletion = useRef(false);
  let { userDetails, setCreditBal, creditBal } = useUserState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Batch Email Verification | Beta Dashboard";
    } else {
      document.title = "Batch Email Verification | Dashboard";
    }
    fetchAllFiles(pageIndex);
    const fileFromDashboard = location.state?.file;
    if (fileFromDashboard) {
      const fakeEvent = { target: { files: [fileFromDashboard] } };
      handleFileChange(fakeEvent);
      navigate(location.pathname, { replace: true });
    }
  }, []);

  useEffect(() => {
    const filteredFilesFinder = resultFile.filter((file) =>
      file.file_upload.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFiles(filteredFilesFinder);
  }, [searchQuery]);

  const fetchAllFiles = async (newPageIndex) => {
    try {
      setLoading(true);
      const allFiles = await axiosInstance.get(
        `/getAllUploadedEmailValidationFiles?page=${newPageIndex}`
      );
      setLoad(100);
      if (allFiles.data.length === 0) {
        setHasMore(false);
        setLoading(false);
      } else {
        const formatDate = (dateTimeString, userTimeZone) => {
          try {
            const date =
              typeof dateTimeString === "string"
                ? new Date(dateTimeString)
                : dateTimeString;

            const timeZone = userTimeZone || "America/New_York";
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: timeZone,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false, // Set to true if you want AM/PM format
            });

            const formattedDate = formatter.format(date);

            return formattedDate.replace(",", ""); // Remove the comma for cleaner output
          } catch (error) {
            console.error("Error formatting date:", error);
            return null; // Return null or a default value on failure
          }
        };
        const filesWithProcessedField = allFiles.data.map((file) => ({
          ...file,
          processed: 0,
          formattedDate: formatDate(file.date_time, userDetails.timeZone),
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
              setFilteredFiles((prevFilteredFiles) =>
                prevFilteredFiles.map((prevFile) =>
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
                setFilteredFiles((prevFilteredFiles) =>
                  prevFilteredFiles.map((prevFile) =>
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
  }, [filesStatus, filteredFiles]);

  const DownloadFile = async (data) => {
    try {
      if (data.processed == 100) {
        setLoading(true);
        let alreadyDownloaded = data.is_downloaded == 1 ? true : false;
        setLoad(30);
        const interval = setInterval(() => {
          setLoad((prev) => (prev < 90 ? prev + 4 : prev));
        }, 1000);
        if (alreadyDownloaded) {
          console.log("first part ");
          let res = await axiosInstance.get(
            `/downloadEmailVerificationFile?batchId=${data.id}&alreadyDownloaded=${alreadyDownloaded}`,
            { responseType: "blob" }
          );

          clearInterval(interval);
          setLoad(100);

          // Handle the file download
          const blob = new Blob([res.data], {
            type: res.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);

          // Create a link element to trigger the download
          let fileName =
            data.file_upload.split(".")[0] +
            "Gamalogic validation results" +
            "." +
            data.file_upload.split(".")[1];
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName); // Use the file name from the backend
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          let res = await axiosInstance.get(
            `/downloadEmailVerificationFile?batchId=${data.id}&alreadyDownloaded=${alreadyDownloaded}`
          );
          clearInterval(interval);
          setLoad(100);
          const { headers, data: responseData, fileName } = res.data;
          console.log(headers, "headers");

          const outputArray = responseData.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header === "") {
                obj[`_${index}`] = "";
              } else {
                obj[header] = row[index];
              }
            });
            return obj;
          });

          console.log(outputArray, "output array ");
          const parts = fileName.split(".");
          const nameWithoutExtension = parts[0];
          const finalFileName = `${nameWithoutExtension}_Gamalogic validation results`;
          const fileExtension = parts[parts.length - 1].toLowerCase();
          switch (fileExtension) {
            case "csv":
              downloadCSV(outputArray, finalFileName);
              break;
            case "xlsx":
              downloadExcel(outputArray, finalFileName, fileExtension);
              break;
            case "xls":
              downloadExcel(outputArray, finalFileName, fileExtension);
              break;
            case "txt":
              downloadText(outputArray, finalFileName);
              break;
            default:
              toast.error("Unsupported file format for download.");
              break;
          }
        }
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

  const downloadCSV = (data, fileName) => {
    const exportType = exportFromJSON.types.csv;
    exportFromJSON({ data, fileName, exportType });
  };

  const downloadExcel = (data, fileName, fileType) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    let extension = "";
    if (fileType === "xlsx") {
      extension = ".xlsx";
    } else if (fileType === "xls") {
      extension = ".xls";
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    XLSX.writeFile(wb, `${fileName}${extension}`);
  };

  const downloadText = (data, fileName) => {
    const textData = data
      .map((item) => `${item.emailid},${item.status}`)
      .join("\n");
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName + ".txt");
    document.body.appendChild(link);
    link.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setRealFile(file);
    if (userDetails.confirm == 1) {
      if (file && file.type === "text/csv") {
        handleCSVFile(
          file,
          setFileForClickUp,
          setJsonToServer,
          setShowAlert,
          toast
        );
      } else if (
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls")
      ) {
        handleXLSXFile(
          file,
          setFileForClickUp,
          setJsonToServer,
          setShowAlert,
          toast
        );
      } else if (
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt")
      ) {
        handleTXTFile(
          file,
          setFileForClickUp,
          setJsonToServer,
          setShowAlert,
          toast
        );
      } else {
        alert("Unsupported file type. Please select a CSV, XLSX, or TXT file.");
      }
    } else {
      toast.error("Please verify your email");
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    if (JsonToServer.data.length <= creditBal) {
      setLoading(true);
      // setLoad(30);
      setShowAlert(false);
      setSpreadSheet(true);
    } else {
      setShowAlert(false);
      toast.error("You dont have enough credits to do this");
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };
  const handleViewChanger = (data) => {
    if (data == "tile") {
      setTileView(true);
    } else {
      setTileView(false);
    }
  };
  const tileViewFetchMore = async () => {
    setPageIndex((prevPageIndex) => {
      const newPageIndex = prevPageIndex + 1;
      fetchAllFiles(newPageIndex);
      return newPageIndex;
    });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query) {
      setFilteredFiles([]);
      setFilesStatus([]);
      return;
    }

    try {
      setLoading(true);

      const searchFiles = await axiosInstance.get(
        `/validatoinfilesSearch?searchQuery=${query}`
      );

      const formatDate = (
        dateTimeString,
        userTimeZone = "America/New_York"
      ) => {
        try {
          const date = new Date(dateTimeString);
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: userTimeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
          return formatter.format(date).replace(",", "");
        } catch {
          return null;
        }
      };

      const filesWithProcessedField = searchFiles.data?.map((file) => {
        const alreadyProcessedFile = resultFile.find(
          (result) => result.id === file.id && result.processed === 100
        );
        return {
          ...file,
          processed: alreadyProcessedFile ? 100 : 0,
          formattedDate: formatDate(file.date_time, userDetails?.timeZone),
        };
      });

      const newFilesForStatus = filesWithProcessedField.filter(
        (file) => file.processed !== 100
      );

      setFilteredFiles(filesWithProcessedField);
      setFilesStatus((prevFilesStatus) => [
        ...prevFilesStatus,
        ...newFilesForStatus,
      ]);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSearchInputChange = (e) => {
    const query = e.target.value.trim();
    handleSearch(query);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleMappingColumns = (data) => {
    try {
      setShowAlert(false);
      setLoad(30);
      const interval = setInterval(() => {
        setLoad((prev) => (prev < 90 ? prev + 4 : prev));
      }, 1000);
      console.log(data, "data");
      const transformedData = JsonToServer.data
        .map((item) => ({
          emailid: item[data.emailField[0]],
        }))
        .filter((item) => item.emailid);
  
      let results = JsonToServer;
      results.data = transformedData;
      console.log(results, fileForClickUp, "transformed Data");
  
      async function BatchEmailVerification() {
        const formData = new FormData();
        formData.append("file", fileForClickUp);
        formData.append("results", JSON.stringify(results));
        console.log(formData, "formData");
        const response = await axiosInstance.post(
          "/batchEmailVerification",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        clearInterval(interval);
        setLoad(100);
        setCreditBal(creditBal - JsonToServer.data.length);
        setMessage(response.data.message);
        toast.success(response.data.message);
        const formatDate = (dateTimeString, userTimeZone) => {
          try {
            const date =
              typeof dateTimeString === "string"
                ? new Date(dateTimeString)
                : dateTimeString;
  
            const timeZone = userTimeZone || "America/New_York";
  
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: timeZone,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
  
            const formattedDate = formatter.format(date);
  
            return formattedDate.replace(",", "");
          } catch (error) {
            console.error("Error formatting date:", error);
            return null;
          }
        };
        setResultFile((prevResultFiles) => [
          {
            ...response.data.files,
            processed: 0,
            formattedDate: formatDate(
              response.data.files.date_time,
              userDetails.timeZone
            ),
          },
          ...prevResultFiles,
        ]);
        setFilesStatus((prevResultFiles) => [
          {
            ...response.data.files,
            processed: 0,
            formattedDate: formatDate(
              response.data.files.date_time,
              userDetails.timeZone
            ),
          },
          ...prevResultFiles,
        ]);
      }
  
      BatchEmailVerification();
      setSpreadSheet(false);
  
    } catch (error) {
      console.log(error, "error");
      if (error.response.status === 500) {
        async function errorHandler() {
          let res = await clickUpAttachment(
            fileForClickUp,
            realFile,
            error.response.data.errorREsponse.id
          );
        }
        errorHandler();
        setServerError(true);
      } else if (
        error.response.status === 400 &&
        error.response.data.errorREsponse
      ) {
        async function errorHandler() {
          let res = await clickUpAttachment(
            fileForClickUp,
            realFile,
            error.response.data.errorREsponse.id
          );
        }
        errorHandler();
        toast.error(error.response?.data?.error);
      } else {
        toast.error(error.response?.data?.error);
      }
      setLoading(false);
    }
  };

  const handleMappingCancel = () => {
    setSpreadSheet(false);
    setJsonToServer(null);
    setLoad(100);
    setLoading(false);
  };
  if (serverError) {
    return <ServerError />;
  }
  return (
    <div
      className="text-center sm:text-left h-screen overflow-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id="scrollableDiv"
    >
      {dragging && <DragAndDropBackground />}
      <InfiniteScroll
        dataLength={
          filteredFiles.length > 0 ? filteredFiles.length : resultFile
        }
        next={fetchMoreFiles}
        hasMore={hasMore}
        loader={
          resultFile.length >= 4 && (
            <div className="w-full mt-4  flex justify-center items-center">
              <MoreFileLoader />
            </div>
          )
        }
        scrollableTarget="scrollableDiv"
        className="px-6 md:px-10 2xl:px-20  pt-8 pb-3 "
      >
        <SubHeader SubHeader={"Upload your file"} />
        <form className="mt-8 sm:mt-8 subHeading flex flex-col sm:flex-none justify-center items-center sm:justify-start sm:items-start">
          {showAlert && (
            <div
              role="alert"
              className="mx-auto max-w-lg rounded-lg border border-stone bg-slate-200 p-4 shadow-xl sm:p-6 lg:p-8 absolute"
              style={{ zIndex: "100" }}
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
                {JsonToServer.data.length} records). Are you sure you want to
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
          {!spreadSheet && (
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <h3>Upload Your File Here | Email Validation</h3>

            <div className="md:flex justify-center items-center  lg:w-3/6  2xl:w-2/5">
              {resultFile.length > 0 && (
                <input
                  type="text"
                  placeholder="Search files by name..."
                  value={searchQuery}
                  onChange={onSearchInputChange}
                  className="w-full my-2 md:my-0 md:mx-4 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {resultFile.length > 0 && (
                <div className="w-full flex justify-center items-center md:w-2/5">
                  <ViewSelector
                    tileView={tileView}
                    onViewChange={handleViewChanger}
                  />
                </div>
              )}
            </div>
          </div>)}
        </form>
        {loading && (
          <LoadingBar
            color="#f74c41"
            progress={load}
            onLoaderFinished={() => {}}
          />
        )}
        {!tileView && resultFile.length > 0 && !spreadSheet && (
          <AddFileInRowView onUpload={handleFileChange} />
        )}
        {resultFile.length > 0 &&
        !spreadSheet && 
          (tileView ? (
            searchQuery.length > 0 ? (
              filteredFiles.length > 0 ? (
                <FileVerificationTile
                  data={filteredFiles}
                  onDownloadFile={DownloadFile}
                  onUpload={handleFileChange}
                />
              ) : (
                <div className="text-center mt-6 text-gray-500">
                  No files found for "{searchQuery}"
                </div>
              )
            ) : (
              <FileVerificationTile
                data={resultFile}
                onDownloadFile={DownloadFile}
                onUpload={handleFileChange}
              />
            )
          ) : searchQuery.length > 0 ? (
            filteredFiles.length > 0 ? (
              <FileRowViewListing
                data={filteredFiles}
                onDownloadFile={DownloadFile}
                onUpload={handleFileChange}
              />
            ) : (
              <div className="text-center mt-6 text-gray-500">
                No files found for "{searchQuery}"
              </div>
            )
          ) : (
            <FileRowViewListing
              data={resultFile}
              onDownloadFile={DownloadFile}
              onUpload={handleFileChange}
            />
          ))}
        {resultFile.length == 0 && !loading && !spreadSheet && (
          <AddFileForFirstTime onUpload={handleFileChange} />
        )}
      </InfiniteScroll>
      {spreadSheet && (
        <ValidationSpreadsheet
          jsonData={JsonToServer}
          onUpload={handleMappingColumns}
          onCancel={handleMappingCancel}
        />
      )}
    </div>
  );
}

export default EmailVerification;
