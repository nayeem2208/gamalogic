import React, { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import { LiaMailBulkSolid } from "react-icons/lia";
import { MdAlternateEmail } from "react-icons/md";
import { MdOutlinePersonSearch } from "react-icons/md";
import VideoModal from "../components/VideoModal";
import AccountDetailsModal from "../components/AccountDetailsModa";
import { useUserState } from "../context/userContext";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DragAndDropBackground from "../components/File/DragAndDropBackground";
import LoadingBar from "react-top-loading-bar";
import AppTour from "../components/AppTour";

function Dashboard() {
  const navigate = useNavigate();
  let [emailAddress, setEmailAddress] = useState("");
  let [finderDetails, setFinderDetails] = useState({
    fullname: "",
    domain: "",
  });
  const [dragging, setDragging] = useState(false);
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let [serverError, setServerError] = useState(false);

  let {
    userDetails,
    setCreditBal,
    creditBal,
    tutorialVideo,
    setTutorialVideo,
    accountDetailsModal,
    setAccountDetailsModal,
    appTour,
    setAppTour
  } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "User Dashboard | Beta Dashboard";
    } else {
      document.title = "User Dashboard | Dashboard";
    }
    localStorage.removeItem("refCode");
    // console.log(window.ztUserData, "user data in quick validation");
    const handleEsc = (e) => {
      if (e.key === "Escape" && tutorialVideo) {
        handleCloseVideoModal();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleCloseVideoModal = () => {
    setTutorialVideo(false);
    if (userDetails.accountDetailsModal) setAccountDetailsModal(true);
  };

  useEffect(() => {
    if (userDetails.accountDetailsModal && !tutorialVideo)
      setAccountDetailsModal(true);
  }, []);

  useEffect(() => {
    if (!userDetails.accountDetailsModal && !tutorialVideo) {
      if (
        appTour &&
        appTour.tour &&
        !appTour.showTour
      ) {
        const storedToken = localStorage.getItem("Gamalogic_token");
  
        if (storedToken) {
          let token;
          try {
            token = JSON.parse(storedToken);
          } catch (error) {
            token = storedToken;
          }
  
          if (token && typeof token === "object") {
            const updatedToken = {
              ...token,
              AppTour: { ...token.AppTour, showTour: true },
            };
            localStorage.setItem("Gamalogic_token", JSON.stringify(updatedToken));
            setAppTour(updatedToken.AppTour)
          }
        }
      }
    }
  }, [userDetails.accountDetailsModal, tutorialVideo, appTour]);
  

  const selectVideoId = () => {
    let ids = ["9CnyAJZiQ38", "_ualvh37g9Y", "imageModal", null];
    let urls = [
      "https://blog.gamalogic.com/email-validation-google-sheets-add-on/",
      "https://blog.gamalogic.com/find-email-address-using-name-and-company-on-google-sheets-add-on/",
      "imageModal",
      null,
    ];
    let texts = [
      "Learn how to integrate the Gamalogic email validation add-on with Google Sheets",
      "Learn more to integrate Gamalogic to find email address list on Google sheets",
      "imageModal",
      null,
    ];
    const index = Math.floor(Math.random() * ids.length);
    return { id: ids[index], url: urls[index], texts: texts[index] };
  };
  const { id, url, texts } = selectVideoId();

  const handleEmailValidation = async (e) => {
    e.preventDefault();
    try {
      if (userDetails.confirm == 1) {
        if (creditBal > 0) {
          let trimmedEmail = emailAddress.trim();
          if (trimmedEmail.length > 0) {
            setLoading(true);
            setLoad(30);
            let res = await axiosInstance.post("/singleEmailValidator", {
              email: emailAddress,
            });
            setCreditBal(creditBal - 1);
            setLoad(100);
            setEmailAddress("");
            const serializedValidationResults = encodeURIComponent(
              JSON.stringify(res.data)
            );
            navigate(
              `/dashboard/quick-validation?result==${serializedValidationResults}`
            );
          } else {
            toast.error("Please provide a valid email address.");
          }
        } else {
          toast.error("You dont have enough credits to do this");
        }
      } else {
        toast.error("Please verify your email");
      }
    } catch (error) {
      console.log(error, "error in validation dashboard");
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };

  const handleFinderDetailsChange = (e) => {
    const { name, value } = e.target;
    setFinderDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleEmailFinder = async (e) => {
    e.preventDefault();
    if (userDetails.confirm == 1) {
      if (creditBal > 9) {
        let domain = finderDetails.domain.trim();
        let fullname = finderDetails.fullname.trim();
        if (domain && fullname) {
          let data = finderDetails;

          setLoading(true);
          setLoad(30);
          let res = await axiosInstance.post("/singleEmailFinder", data);
          setLoad(100);
          setCreditBal(creditBal - 10);
          setFinderDetails({ fullname: "", domain: "" });
          const serializedFinderDetails = encodeURIComponent(
            JSON.stringify(res.data)
          );

          navigate(`/dashboard/email-finder?result=${serializedFinderDetails}`);
        } else {
          toast.error("Please provide valid fullname and domain");
        }
      } else {
        toast.error("You dont have enough credits to do this");
      }
    } else {
      toast.error("Please verify your email");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      navigate("/dashboard/file-upload", { state: { file } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    console.log("its working");
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
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div
      className="affiliate-container  px-6 md:px-10 py-8 accountSettings text-center sm:text-start"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {tutorialVideo && (
        <VideoModal
          videoId={id}
          url={url}
          texts={texts}
          isOpen={tutorialVideo}
          onClose={handleCloseVideoModal}
        />
      )}
      {accountDetailsModal && (
        <AccountDetailsModal isOpen={accountDetailsModal} />
      )}
      {dragging && <DragAndDropBackground />}

      <SubHeader SubHeader={"Dashboard"} />
      {loading && (
        <LoadingBar
          color="#f74c41"
          progress={load}
          onLoaderFinished={() => {}}
        />
      )}
      <div
        className="lg:flex justify-between mt-20 gap-6"
        style={{ color: "#010B25" }}
      >
        <div className="w-full  lg:w-3/5">
          {/* Single Email Validation */}
          <div
            style={{
              background:
                "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
            }}
            className="  py-4 px-5 rounded-xl shadow-md"
          >
            <div className="h-full">
              <div className="flex items-center">
                <div className="bg-white flex justify-center items-center rounded-xl w-14 h-12 mr-4 shadow-lg">
                  <MdAlternateEmail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="sm:text-lg text-xl lg:text-2xl font-semibold">
                    Email Validation
                  </h2>
                </div>
              </div>
              <div className="w-full my-4">
                <div>
                  {/* <label htmlFor="" placeholder="">Email</label> */}
                  <input
                    type="email"
                    className="p-2 rounded-lg mt-1  w-full border  shadow-sm"
                    placeholder="Enter email  here"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                <div className="SingleTileDownload w-full flex justify-center  items-center mt-5 px-2">
                  <button
                    className="w-56 h-10 flex justify-center items-center"
                    onClick={handleEmailValidation}
                  >
                    <span className="transition"></span>
                    <span className="gradient"></span>
                    {!tutorialVideo && (
                      <span className="label flex  justify-center items-center font-sm  font-semibold rounded-md mt-4">
                        VALIDATE
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* file upload Email validaiton */}
          <div
            style={{
              background:
                "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
            }}
            className="  py-4 px-5 rounded-xl shadow-xl mt-6"
          >
            <div className="flex items-center">
              <div className="bg-white flex justify-center items-center rounded-xl w-14 h-12 mr-4 shadow-lg">
                <LiaMailBulkSolid className="w-6 h-6 " />
              </div>
              <div>
                <h2 className="sm:text-lg text-xl lg:text-2xl font-semibold">
                  Upload your file to validate
                </h2>
              </div>
            </div>
            <div className="flex flex-col my-4 justify-center items-center w-full  text-center">
              <p className="  text-[13px]">
                You can upload your email list in one of the following formats:
              </p>
              <div className="flex justify-center ">
                <div className="flex flex-wrap   justify-evenly my-2 ">
                  <img
                    src="/csv(1).png"
                    alt="csvFile"
                    className="w-8 2xl:w-10  m-1"
                  />
                  <img
                    src="/xls(1).png"
                    alt="xlsFile"
                    className="w-8 2xl:w-10 m-1"
                  />
                  <img
                    src="/xlsx(1).png"
                    alt="xlsxFile"
                    className="w-8 2xl:w-10 m-1"
                  />
                  <img
                    src="/txt(1).png"
                    alt="txtFile"
                    className="w-8 2xl:w-10 m-1"
                  />
                </div>
              </div>
              <p className="  mb-6 text-[13px] ">
                Drag and drop your file here or click the button below to select
                a file.
              </p>
              <button
                className="flex items-center justify-center w-full text-[#18233E] hover:bg-[#18233E] hover:text-[#dde6ff]   border border-[#18233E] hover:border-[#5a79c6]  px-6 rounded-lg font-medium   transition duration-300"
                onClick={() => document.getElementById("fileInput").click()}
                // style={{ color: "#18233E", }}
              >
                <span className="text-3xl mr-2 text-center">+</span>
              </button>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {/* Single email finder */}
        <div
          style={{
            background:
              "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
          }}
          className="mt-10 lg:mt-0 w-full lg:w-2/5 py-4 px-5 rounded-xl shadow-xl"
        >
          <div className="flex items-center">
            <div className="bg-white flex justify-center items-center rounded-xl w-14 h-12 mr-4 shadow-lg">
              <MdOutlinePersonSearch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="sm:text-lg text-xl lg:text-2xl font-semibold">
                {" "}
                Email Finder
              </h2>
              {/* <p>Quick & Secure Email Validation</p> */}
            </div>
          </div>
          <p className="text-sm mt-6 font-light mb-7">
            Gamalogic Email Finder empowers you to effortlessly identify valid
            email addresses based on your input. This tool leverages advanced
            algorithms to validate and ensure the email addresses you gather
            align accurately with the provided information, saving you time and
            improving efficiency.
          </p>
          <div>
            <label htmlFor="" className="">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={finderDetails.fullname}
              onChange={handleFinderDetailsChange}
              className="p-2  text-sm rounded-lg mt-1  w-full mb-7 border shadow-sm"
              placeholder="Enter Full Name"
            />
          </div>
          <label htmlFor="" className="">
            Company Domain
          </label>
          <div>
            <input
              type="text"
              name="domain"
              value={finderDetails.domain}
              onChange={handleFinderDetailsChange}
              className="p-2 text-sm  rounded-lg mt-1  w-full border shadow-sm"
              placeholder="Enter Company Domain (eg: www.google.com)"
            />
          </div>
          <div className="SingleTileDownload w-full flex   justify-center items-center mt-5 px-2">
            <button
              className="w-56 h-10 flex justify-center items-center"
              onClick={handleEmailFinder}
            >
              <span className="transition"></span>
              <span className="gradient"></span>
              {!tutorialVideo && (
                <span className="label flex  justify-center items-center font-sm  font-semibold rounded-md mt-4">
                  FIND EMAIL
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
