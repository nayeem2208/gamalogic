import { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";
import { useUserState } from "../context/userContext";
import VideoModal from "../components/VideoModal";

function QuickValidation() {
  let [email, setEmail] = useState("");
  let [result, setResult] = useState("");
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let [serverError, setServerError] = useState(false);
  let {
    userDetails,
    setCreditBal,
    creditBal,
    tutorialVideo,
    setTutorialVideo,
  } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Quick Validation | Beta Dashboard";
    } else {
      document.title = "Quick Validation | Dashboard";
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (userDetails.confirm == 1) {
        if (creditBal > 0) {
          let trimmedEmail = email.trim();
          if (trimmedEmail.length > 0) {
            setLoading(true);
            setLoad(30);
            let res = await axiosInstance.post("/singleEmailValidator", {
              email,
            });
            setCreditBal(creditBal - 1);
            setLoad(100);
            setResult(res.data);
            setEmail("");
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
      if (error.response.status === 500) {
        setServerError(true);
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };
  const handleCloseVideoModal = () => {
    setTutorialVideo(false);
  };
  const selectVideoId = () => {
    let ids = ["9CnyAJZiQ38", "_ualvh37g9Y"];
    const index = Math.floor(Math.random() * ids.length);
    return ids[index];
  };
  console.log(result, "res");
  if (serverError) {
    return <ServerError />;
  }
  return (
    <div className=" px-6 md:px-20 py-8">
      {tutorialVideo && (
        <VideoModal
          videoId={selectVideoId()}
          isOpen={tutorialVideo}
          onClose={handleCloseVideoModal}
        />
      )}
      <SubHeader SubHeader={"Quick Validation"} />
      <div className="mt-14 text-bgblue subHeading text-center sm:text-left">
        <h3>Single Email Validator</h3>
        <p className="my-7 description">
          Type in any email address to have it quickly validated.
        </p>
        <form
          onSubmit={submitHandler}
          style={{ fontFamily: "Raleway,sans-serif" }}
        >
          <div className="">
            <input
              type="email"
              value={email}
              placeholder="enter the email here"
              className="w-full sm:w-3/6 lg:w-2/6 border border-gray-400 text-md rounded-md py-2 px-4 mr-3"
              onChange={(e) => setEmail(e.target.value)}
            />{" "}
            <button
              className="bg-bgblue text-white mt-3 sm:mt-0 py-2 px-4 rounded-md text-sm font-medium"
              type="submit"
            >
              VALIDATE
            </button>
          </div>
        </form>
        {loading && (
          <LoadingBar
            color="#f74c41"
            progress={load}
            onLoaderFinished={() => {}}
          />
        )}
        {result && (
          <div className="flex flex-col justify-center items-center sm:flex-none sm:justify-start sm:items-start">
            <p className="font-medium text-lg mt-8 mb-4">Result</p>
            <p className="description text-base">
              {result.emailid} is{" "}
              {result.is_valid ? (
                <span className="text-emerald-500 font-semibold">Valid</span>
              ) : (
                <span className="text-red-400 font-semibold">Not Valid</span>
              )}
            </p>
            <table className="description QucikValidationtable my-4  w-2/6">
              <tbody>
                <tr>
                  <td className="mr-5 py-2">catchall</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {result.is_catchall ? (
                      <div className="bg-emerald-500 w-3 h-3 rounded"></div>
                    ) : (
                      <div className="bg-red-400 w-3 h-3 rounded"></div>
                    )}
                    <p className="ml-2">{result.is_catchall.toString()}</p>
                  </td>
                </tr>
                <tr>
                  <td className="mr-5 py-2">disposable</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {result.is_disposable ? (
                      <div className="bg-emerald-500 w-3 h-3 rounded"></div>
                    ) : (
                      <div className="bg-red-400 w-3 h-3 rounded"></div>
                    )}
                    <p className="ml-2">{result.is_disposable.toString()}</p>
                  </td>
                </tr>
                <tr>
                  <td className="mr-5 py-2">role</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {result.is_role ? (
                      <div className="bg-emerald-500 w-3 h-3 rounded"></div>
                    ) : (
                      <div className="bg-red-400 w-3 h-3 rounded"></div>
                    )}
                    <p className="ml-2">{result.is_role.toString()}</p>
                  </td>
                </tr>
                <tr>
                  <td className="mr-5 py-2">syntax_valid</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {result.is_syntax_valid ? (
                      <div className="bg-emerald-500 w-3 h-3 rounded"></div>
                    ) : (
                      <div className="bg-red-400 w-3 h-3 rounded"></div>
                    )}
                    <p className="ml-2">{result.is_syntax_valid.toString()}</p>
                  </td>
                </tr>
                <tr>
                  <td className="mr-5 py-2">unknown</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {result.is_unknown ? (
                      <div className="bg-emerald-500 w-3 h-3 rounded"></div>
                    ) : (
                      <div className="bg-red-400 w-3 h-3 rounded"></div>
                    )}
                    <p className="ml-2">{result.is_unknown.toString()}</p>{" "}
                  </td>
                </tr>
                <tr>
                  <td className="mr-5 py-2">message</td>
                  <td className="mr-5 py-2 flex justify-center items-center">
                    {" "}
                    {result.is_valid ? <p>Valid</p> : <p>Not Valid</p>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickValidation;
