import { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import axiosInstance, { APP } from "../axios/axiosInstance";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import ServerError from "./ServerError";
import { useUserState } from "../context/userContext";
import { useNavigate } from "react-router-dom";

function EmailFinder() {
  let [data, setData] = useState({ fullname: "", domain: "" });
  let [result, setResult] = useState("");
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let [serverError, setServerError] = useState(false);

    const navigate = useNavigate();
  

  let { userDetails, setCreditBal, creditBal } = useUserState();

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Email Finder | Beta Dashboard";
    } else {
      document.title = "Email Finder | Dashboard";
    }
    parseQueryParams();
  }, []);

  const parseQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get("result");
    if (result) {
      try {
        const parsedDetails = JSON.parse(decodeURIComponent(result));
        setResult(parsedDetails);
      } catch (error) {
        console.error("Invalid result format in URL", error);
      }
    }
    urlParams.delete("result");
    navigate(`?${urlParams.toString()}`, { replace: true });
  };


  function onInputChange(event, inputType) {
    const value = event.target.value;
    setData((prevData) => ({
      ...prevData,
      [inputType]: value,
    }));
  }

  const HandleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (userDetails.confirm == 1) {
        if (creditBal > 9) {
          setResult("");
          let domain = data.domain.trim();
          let fullname = data.fullname.trim();
          if (domain && fullname) {
            setLoading(true);
            setLoad(30);
            const interval = setInterval(() => {
              setLoad((prev) => (prev < 90 ? prev + 4 : prev));
            }, 1000);
            let res = await axiosInstance.post("/singleEmailFinder", data);
            clearInterval(interval);
            setLoad(100);
            setCreditBal(creditBal - 10);
            setResult(res.data);
            setData({ fullname: "", domain: "" });
          } else {
            toast.error("Please provide valid fullname and domain");
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

  if (serverError) {
    return <ServerError />;
  }
  return (
    <div className=" px-6 md:px-20 py-8 text-center sm:text-left">
      <SubHeader SubHeader={"Email Finder"} />
      <div className="mt-14 subHeading text-center sm:text-left">
        <h3>Find The Email Address</h3>
        <p className="my-7  description">
          Enter a full name and the domain name of the email address below to
          find the email address of any professional with our email finding
          tool.
        </p>
        <div className="sm:flex  xl:w-4/5 justify-center sm:justify-between flex flex-col sm:flex-row">
          <form
            style={{ fontFamily: "Raleway,sans-serif" }}
            className="flex flex-col justify-center items-center sm:items-start sm:justify-normal w-full sm:w-8/12 md:w-5/12 lg:w-8/12 text-sm"
            onSubmit={HandleSubmit}
          >
            <p>Full Name</p>
            <input
              type="text"
              placeholder="Tim cook"
              className=" border border-gray-400 rounded-md py-2 px-4 sm:mr-3 w-4/5"
              value={data.fullname}
              onChange={(e) => onInputChange(e, "fullname")}
            />
            <p className="mt-4">Domain Name</p>
            <input
              type="text"
              placeholder="apple.com"
              className=" border border-gray-400 rounded-md py-2 px-4 sm:mr-3 w-4/5"
              value={data.domain}
              onChange={(e) => onInputChange(e, "domain")}
            />
            <button
              className="bg-bgblue text-white py-2 px-2 rounded-md text-sm font-medium w-2/5  sm:w-3/5 lg:w-2/5 mt-8"
              type="submit"
            >
              FIND EMAIL
            </button>
          </form>
          <div className=" flex justify-center sm:justify-end sm:w-3/6 text-sm">
            <p
              className="bg-gray-100 rounded h-2/5 text-base p-2 mt-6 font-semibold"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              Note:
              <br />
              <span
                className="font-light text-xs sm:text-base"
                style={{ fontFamily: "Raleway,sans-serif" }}
              >
                {" "}
                Each check will cost you 10 credits!
              </span>
            </p>
          </div>
        </div>
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
            {result.email ? (
              <div>
                <p className="description text-base">
                  We found 1 email addresses.
                </p>
                <table className="description QucikValidationtable my-4  md:w-2/6">
                  <tbody>
                    <tr>
                      <td className="mr-5 py-2">{result.email}</td>
                      <td className="mr-5 py-2 flex justify-center items-center">
                        <button
                          className="bg-bgblue text-white p-1 rounded-md   text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(result.email);
                          }}
                        >
                          COPY
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Oops! Sorry, we couldn&apos;t help you.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailFinder;
