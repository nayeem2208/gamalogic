import { useEffect, useRef, useState } from "react";
import SubHeader from "../components/SubHeader";
import Papa from "papaparse";
import exportFromJSON from "export-from-json";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import ProgressBar from "@ramonak/react-progress-bar";
import Alert from "../components/Alert";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";
import { IoDownload } from "react-icons/io5";
import InfiniteScroll from "react-infinite-scroll-component";
import clickUpAttachment from "../utils/clickup";
import * as XLSX from "xlsx";
import MoreFileLoader from "../components/MoreFileLoader";
import FileVerificationTile from "../components/File/FileVerificationTile";
import ViewSelector from "../components/File/ViewSelector";
import AddFileForFirstTime from "../components/File/AddFileForFirstTime";
import DragAndDropBackground from "../components/File/DragAndDropBackground";
import AddFileInRowView from "../components/File/AddFileInRowView";
import FileRowViewListing from "../components/File/FileRowView";
import Spreadsheet from "../components/TableCheck";
import { useLocation, useNavigate } from "react-router-dom";

function FileEmailFinder() {
  let [message, setMessage] = useState("");
  let [resultFile, setResultFile] = useState([]);
  let [loading, setLoading] = useState(false);
  const [filesStatus, setFilesStatus] = useState([]);
  const isCheckingCompletion = useRef(false);
  const [showAlert, setShowAlert] = useState(false);
  const [Selection, SetSelection] = useState(null);
  const [JsonToServer, setJsonToServer] = useState([]);
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
  const [matchingFile, setMatchingFile] = useState(null);
  const [resultFileReady, setResultFileReady] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [dateTime, setDateTime] = useState(null);

  let { creditBal, setCreditBal, userDetails } = useUserState();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Batch Email Verification | Beta Dashboard";
    } else {
      document.title = "Batch Email Verification | Dashboard";
    }
    fetchAllFiles(pageIndex);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setFileUpload(queryParams.get("file_upload"));
    setDateTime(queryParams.get("date_time"));
  }, []);

  useEffect(() => {
    if (fileUpload && dateTime) {
      const removeFileExtension = (fileName) => {
        return fileName.split(".").slice(0, -1).join(".").trim();
      };

      const convertToISODate = (localizedDate) => {
        const date = new Date(localizedDate);
        return date.toISOString();
      };

      const matchedFile = resultFile.find((file) => {
        const fileUploadMatch =
          removeFileExtension(file.file_upload) == fileUpload;
        const normalizedDateTime = convertToISODate(dateTime);
        const fileDateTime = convertToISODate(file.date_time);
        const fileDateTimeAfterSplit =
          fileDateTime.split(":")[0] + fileDateTime.split(":")[1];
        const normalizedDateTimeSplit =
          normalizedDateTime.split(":")[0] + normalizedDateTime.split(":")[1];
        const dateTimeMatch =
          fileDateTimeAfterSplit === normalizedDateTimeSplit;

        return fileUploadMatch && dateTimeMatch;
      });

      if (matchedFile) {
        setMatchingFile(matchedFile);

        // Clear the URL parameters after matching
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.delete("file_upload");
        newSearchParams.delete("date_time");
        navigate({ search: newSearchParams.toString() }, { replace: true });
      }
    }
  }, [
    fileUpload,
    dateTime,
    resultFile,
    resultFileReady,
    loading.search,
    navigate,
  ]);

  const fetchAllFiles = async (newPageIndex) => {
    try {
      setLoading(true);
      let allFiles = await axiosInstance.get(
        `/getAllUploadedEmailFinderFiles?page=${newPageIndex}`
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
          processed: file.is_download == 1 ? 100 : 0,
          formattedDate: formatDate(file.date_time, userDetails.timeZone),
        }));
        const allProcessed = filesWithProcessedField.every(
          (file) => file.processed === 100
        );
        // if (!allProcessed) {
        setResultFile((prevResultFiles) => [
          ...prevResultFiles,
          ...filesWithProcessedField,
        ]);
        // }
        setFilesStatus((prevResultFiles) => [
          ...prevResultFiles,
          ...filesWithProcessedField,
        ]);
      }

      // setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
      setLoad(100);
    }
  };

  const fetchMoreFiles = async () => {
    setPageIndex((prevPageIndex) => {
      const newPageIndex = prevPageIndex + 1;
      fetchAllFiles(newPageIndex);
      return newPageIndex;
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setRealFile(file);
    if (userDetails.confirm == 1) {
      if (file && file.type === "text/csv") {
        handleCSVFile(file);
      } else if (
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls")
      ) {
        handleXLSXFile(file);
      } else if (
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt")
      ) {
        handleTXTFile(file);
      } else {
        alert("Unsupported file type. Please select a CSV, XLSX, or TXT file.");
      }
    } else {
      toast.error("Please verify your email");
    }
  };

  const handleCSVFile = async (file) => {
    try {
      setFileForClickUp(file);
      Papa.parse(file, {
        header: false,
        complete: async function (results) {
          // Filter out empty rows
          const filteredData = results.data.filter((row) => {
            // Check if any cell in the row has a non-empty value
            return row.some((cell) => cell && cell.trim() !== "");
          });

          results.data = filteredData; // Update the results with filtered data
          results.fileName = file.name;

          if (results.data.length <= 100000 && results.data.length > 0) {
            setJsonToServer(results);
            setShowAlert(true);
          } else if (results.data.length == 0) {
            toast.error(
              "Please upload a file with columns first name, last name and domain"
            );
          } else {
            toast.error("Please select a file with not more than 100,000 rows");
          }
        },
      });
    } catch (error) {
      setLoading(false);
      console.error("Error uploading file:", error);
    }
  };

  const handleXLSXFile = async (file) => {
    setFileForClickUp(file);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (rows.length > 0) {
        rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
      }

      // Extract and clean headers
      // const headers = rows[0].map((header) => header.trim());
      console.log(rows, "rows from xcel");
      // Map the rows to objects using the cleaned headers
      // const contacts = rows.slice(1).map((row) => {
      //   const contact = {};
      //   row.forEach((value, index) => {
      //     contact[headers[index]] = value;
      //   });
      //   return contact;
      // });
      const contacts = rows;

      const fileName = file.name;
      console.log(contacts, "contacts in xls");
      if (contacts.length <= 100000 && contacts.length > 0) {
        setJsonToServer({ data: contacts, fileName: fileName });
        setShowAlert(true);
      } else if (contacts.length == 0) {
        toast.error(
          "Please upload a file with columns first name, last name and domain"
        );
      } else {
        toast.error(
          "Please select an Excel file with not more than 100,000 records."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleTXTFile = async (file) => {
    setFileForClickUp(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      let err = false;
      // Process all lines (no need to skip headers or map to headers)
      const contacts = lines
        .filter((line) => line.trim() !== "") // Remove empty lines
        .map((line) => {
          return line.split(",").map((item) => item.trim()); // Split each line by commas and trim
        });

      if (err) {
        toast.error(
          "Please upload a file with consistent column headers and values."
        );
        return;
      }

      const fileName = file.name;
      if (contacts.length <= 100000) {
        setJsonToServer({ data: contacts, fileName: fileName }); // Pass data as array of arrays
        setShowAlert(true);
      } else {
        toast.error(
          "Please select a TXT file with not more than 100,000 records."
        );
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (showAlert && Selection !== null) {
      if (Selection === true) {
        if (creditBal >= JsonToServer.data.length * 10) {
          setShowAlert(false);
          SetSelection(null);
          setLoading(true);
          setSpreadSheet(true);
        } else {
          setShowAlert(false);
          SetSelection(null);
          toast.error("You dont have enough credits to do this");
        }
      } else {
        setShowAlert(false);
        setJsonToServer([]);
        SetSelection(null);
      }
    }
  }, [Selection]);

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
              if (res.data.emailStatus.total > 100) {
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
        // Reset the flag after completion check
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
        let alreadyDownloaded = data.is_download == 1 ? true : false;
        setLoad(30);
        const interval = setInterval(() => {
          setLoad((prev) => (prev < 90 ? prev + 4 : prev));
        }, 1000);
        if (alreadyDownloaded) {
          let res = await axiosInstance.get(
            `/downloadEmailFinderFile?batchId=${data.id}&alreadyDownloaded=${alreadyDownloaded}`,
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
            "Gamalogic Finder Results" +
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
            `/downloadEmailFinderFile?batchId=${data.id}&alreadyDownloaded=${alreadyDownloaded}`
          );
          clearInterval(interval);
          setLoad(100);
          const { headers, data: responseData, fileName } = res.data;
          console.log(headers, "headers");
          console.log(responseData, "data to downloaddddd");
          const outputArray = responseData.map((row) => {
            const obj = [];
            headers.forEach((header, index) => {
              if (header === "") {
                obj[`_${index}`] = "";
              } else {
                obj[index] = row[index];
              }
            });
            return obj;
          });

          console.log(outputArray, "output array ");
          // const fileName = res.data.fileName;
          const parts = fileName.split(".");
          const nameWithoutExtension = parts[0];
          const finalFileName = `${nameWithoutExtension}_Gamalogic Finder Results`;
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
      if (error.response?.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
      setLoading(false);
      console.log(error);
    }
  };

  const downloadCSV = (data, fileName) => {
    // Convert data to CSV format without headers
    const csvContent = data
      .map((row) => {
        return Object.values(row).join(","); // Join values with a comma
      })
      .join("\n"); // Join rows with a newline

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName + ".csv");
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (data, fileName, fileType) => {
    console.log(data, "data in excel download");

    // Convert data to an array of arrays (if it's not already)
    const rows = data.map((row) => {
      return Object.values(row); // Extract values from each row object
    });

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows); // Use aoa_to_sheet for array of arrays
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Determine the file extension
    let extension = "";
    if (fileType === "xlsx") {
      extension = ".xlsx";
    } else if (fileType === "xls") {
      extension = ".xls";
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Write the file and trigger the download
    XLSX.writeFile(wb, `${fileName}${extension}`);
  };

  const downloadText = (data, fileName) => {
    console.log(data, "dataaaaaaaaaaa of txt");

    // Convert the data to a string format
    const fileContent = data
      .map((row) => {
        // Extract all values from the row object
        const values = Object.values(row).join(" "); // Join all values with a space
        return values;
      })
      .join("\n"); // Join all rows with a newline

    // Create a Blob with the file content
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName + ".txt");
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAccept = (value) => {
    SetSelection(value);
    showAlert(false);
  };

  const handleDismiss = (value) => {
    SetSelection(value);
    showAlert(false);
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
      const filteredFilesFinder = resultFile.filter((file) =>
        file.file_upload.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filteredFilesFinder);
      const searchFiles = await axiosInstance.get(
        `/finderfilesSearch?searchQuery=${query}`
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

      const filesWithProcessedField = searchFiles.data.map((file) => {
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
        ...newFilesForStatus,
        ...prevFilesStatus,
      ]);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update searchQuery state on input change
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
    setLoad(30);
    const interval = setInterval(() => {
      setLoad((prev) => (prev < 90 ? prev + 4 : prev));
    }, 1000);
    
    let firstNameIndex = JsonToServer.data[0].indexOf(data.firstNameField[0]);
    let lastNameIndex = JsonToServer.data[0].indexOf(data.lastNameField[0]);
    let domainIndex = JsonToServer.data[0].indexOf(data.domainField[0]);


    const transformedData = JsonToServer.data // Excluding header row
      .map((item) => ({
        first_name: item[firstNameIndex],
        last_name: item[lastNameIndex],
        domain: item[domainIndex],
      }))
      .filter((item) => item.first_name || item.last_name || item.domain);
    // setLoad(50);
    // let results = JsonToServer;
    // results.data = transformedData;
    let results = { ...JsonToServer, data: transformedData };
    // results.fields = data;
    // setLoad(60);
    async function BatchFileFinder() {
      const formData = new FormData();
      formData.append("file", fileForClickUp);
      formData.append("results", JSON.stringify(results));
      formData.append("fields", JSON.stringify(data));
      try {
        const response = await axiosInstance.post(
          "/batchEmailFinder",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        clearInterval(interval);

        setLoad(100);
        setCreditBal(creditBal - results.data.length * 10);
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
              hour12: false, // Set to true if you want AM/PM format
            });

            const formattedDate = formatter.format(date);

            return formattedDate.replace(",", ""); // Remove the comma for cleaner output
          } catch (error) {
            console.error("Error formatting date:", error);
            return null; // Return null or a default value on failure
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
        } else if (
          error.response.status === 400 &&
          error.response.data.errorREsponse
        ) {
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
    }
    BatchFileFinder();
    setSpreadSheet(false);
  };

  const handleMappingCancel = () => {
    setSpreadSheet(false);
    setJsonToServer(null);
    setLoad(100);
    setLoading(false)

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
      id="scrollableDivFinder"
    >
      {dragging && !spreadSheet && <DragAndDropBackground />}
      <InfiniteScroll
        dataLength={
          filteredFiles.length > 0 ? filteredFiles.length : resultFile.length
        }
        next={fetchMoreFiles}
        hasMore={hasMore}
        loader={
          (filteredFiles.length >= 1 || resultFile.length >= 1) && (
            <div className="w-full mt-4  flex justify-center items-center">
              <MoreFileLoader />
            </div>
          )
        }
        scrollableTarget="scrollableDivFinder"
        className="px-6 md:px-10 2xl:px-20  py-8 "
      >
        <SubHeader SubHeader={"Upload your file"} />
        {showAlert && (
          <Alert
            sizeOfData={JsonToServer}
            selection={Selection} // Pass down selection state
            setSelection={SetSelection} // Pass down function to update selection
            onAccept={() => SetSelection(true)} // Update selection on accept
            onDismiss={() => SetSelection(false)} // Update selection on dismiss
          />
        )}
        {!spreadSheet && (
          <div className="mt-8 sm:mt-14 subHeading flex flex-col sm:flex-none justify-center items-center sm:justify-start sm:items-start">
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <h3>Upload Your File Here | Email Finder</h3>

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
                  <div className="w-full  justify-center items-center md:w-2/5 hidden sm:flex">
                    <ViewSelector
                      tileView={tileView}
                      onViewChange={handleViewChanger}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!tileView && resultFile.length > 0 && !spreadSheet && (
          <AddFileInRowView onUpload={handleFileChange} />
        )}
        {loading && (
          <LoadingBar
            color="#f74c41"
            progress={load}
            onLoaderFinished={() => {}}
          />
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
              matchingFile={matchingFile}
            />
          ))}

        {resultFile.length == 0 && !loading && !spreadSheet && (
          <AddFileForFirstTime onUpload={handleFileChange} />
        )}
      </InfiniteScroll>
      {spreadSheet && (
        <Spreadsheet
          jsonData={JsonToServer}
          onUpload={handleMappingColumns}
          onCancel={handleMappingCancel}
        />
      )}
    </div>
  );
}

export default FileEmailFinder;
