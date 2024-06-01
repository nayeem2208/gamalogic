import { useEffect, useRef, useState } from "react";
import SubHeader from "../components/SubHeader";
import Papa from "papaparse";
import exportFromJSON from "export-from-json";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import ProgressBar from "@ramonak/react-progress-bar";
import Alert from "../components/Alert";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";
import { IoDownload } from "react-icons/io5";
import InfiniteScroll from "react-infinite-scroll-component";

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

  let { creditBal, setCreditBal, userDetails } = useUserState();

  useEffect(() => {
    document.title = "Batch Email Finder | Beta Dashboard";
    fetchAllFiles(pageIndex);
  }, []);

  const fetchAllFiles = async (newPageIndex) => {
    try {
      setLoading(true);
      let allFiles = await axiosInstance.get(
        `/getAllUploadedEmailFinderFiles?page=${newPageIndex}`
      );
      setLoad(100);
      if (allFiles.data.length === 0) {
        setHasMore(false);
      } else {
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
    if (userDetails.confirm == 1) {
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
              if (results.data.length <= 100000) {
                // if (creditBal >= (results.data.length-1 )* 10) {
                setJsonToServer(results);
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

  useEffect(() => {
    if (showAlert && Selection !== null) {
      if (Selection === true) {
        console.log(JsonToServer, "json to server");
        if (creditBal >= JsonToServer.data.length * 10) {
          setShowAlert(false);
          SetSelection(null)
          setLoading(true);
          setLoad(30);
          let results = JsonToServer;
          async function BatchFileFinder() {
            try {
              const response = await axiosInstance.post(
                "/batchEmailFinder",
                results
              );
              setLoad(100);
              setCreditBal(creditBal - results.data.length * 10);
              toast.success(response.data.message);
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
              if (error.response.status === 500) {
                setServerError(true);
              } else {
                toast.error(error.response?.data?.error);
              }
              setLoading(false);
            }
          }
          BatchFileFinder();
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
              setMessage("");
            } else {
              const progress = Math.round(
                (res.data.emailStatus.processed / res.data.emailStatus.total) *
                  100
              );
              let adjustedProgress
              if(res.data.emailStatus.total>100){
                 adjustedProgress=progress
              }
              else{
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
        setLoading(true);
        setLoad(30);
        let res = await axiosInstance.get(
          `/downloadEmailFinderFile?batchId=${data.id}`
        );
        setLoad(100);
        const outputArray = res.data.datas.gamalogic_discovery.map((obj) => {
          let remarks = "";
          if (obj.is_catchall == 1) {
            remarks = "Catch all Address";
          } else {
            remarks = "Valid Address";
          }
          return {
            Domain: obj.domain,
            FirstName: obj.firstname,
            LastName: obj.lastname,
            Email_Address: obj.email_address,
            Remarks: remarks,
          };
        });
        const csvData = outputArray;
        const fileName = res.data.fileName;
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
      setLoading(false);
    }
  };

  const handleAccept = (value) => {
    SetSelection(value);
    showAlert(false)
  };

  const handleDismiss = (value) => {
    SetSelection(value);
    showAlert(false);
  };
  console.log(resultFile, "resultFile");

  if (serverError) {
    return <ServerError />;
  }
  return (
    <div className=" px-6 md:px-20 py-8">
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
      <div className="mt-8 sm:mt-14 subHeading flex flex-col sm:flex-none justify-center items-center sm:justify-start sm:items-start">
        <h3>Upload Your File Here | Email Finder</h3>
        <p className="my-7  description">
          You can upload the email address list in csv file and get results in
          csv. Download a sample file to upload here Select a file to upload.
        </p>
        <input
          type="file"
          className="flex h-9 shadow-lg text-white rounded-lg font-semibold  border border-input bg-red-600 hover:bg-red-800 bg-background px-3 py-1 text-sm  transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground file:shadow-xl file:bg-red-900 hover:file:bg-red-600 file:rounded-lg file:px-4 file:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 "
          onChange={handleFileChange}
          accept=".csv"
        />
      </div>
      {loading && (
        <LoadingBar
          color="#f74c41"
          progress={load}
          onLoaderFinished={() => {}}
        />
      )}
      {resultFile.length > 0 && (
        <div className="overflow-x-auto">
          <InfiniteScroll
            dataLength={resultFile.length}
            next={fetchMoreFiles}
            hasMore={hasMore}
            height={300}
            loader={resultFile.length>=4&&(<div className="w-full mt-4  flex justify-center items-center"><div
            className="mt-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div></div>)}
            // endMessage={<p className="text-xs">No more data to load.</p>}
          >
            <table
              className="text-bgblue w-full  mt-14"
              style={{ fontFamily: "Raleway,sans-serif" }}
            >
              <tbody>
                <tr className="sm:text-left text-xs sm:text-sm ">
                  <th className="font-normal md:w-1/5 ">File Name</th>
                  <th className="font-normal  md:w-2/5">Status</th>
                  <th className="font-normal  md:w-1/5">Upload Time</th>
                  <th className=""></th>
                </tr>
                {resultFile.map((data, index) => (
                  <tr key={index} className="text-xs sm:text-sm ">
                    <td className="md:pt-5">{data.file_upload}</td>
                    <td className="flex ">
                      <ProgressBar
                        isLabelVisible={false}
                        completed={data.processed}
                        bgColor="#181e4a"
                        labelSize="13px"
                        className="md:w-2/5  mr-2"
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
      )}
    </div>
  );
}

export default FileEmailFinder;
