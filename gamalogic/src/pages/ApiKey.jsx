import { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import axiosInstance from "../axios/axiosInstance";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";

function ApiKey() {
  let [api, setApi] = useState("");
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let { userDetails } = useUserState();

  useEffect(() => {
    async function fetchApikey() {
      try {
        setLoading(true);
        let res = await axiosInstance.get("/getApiKey");
        setLoad(100);
        setApi(res.data.apiKey);
      } catch (error) {
        console.log(error);
      }
    }
    fetchApikey();
  }, []);

  let resetApiKey = async () => {
    try {
      setLoading(true);
      setLoad(30);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let resetApiKey = await axiosInstance.get("/resetApiKey");
      setLoad(100);
      toast.success("Your api key has been updated");
      setApi(resetApiKey.data.newApiKey);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"API Key"} />
      {userDetails.confirm == 1 ? (
        <div className="mt-14 subHeading">
          <h3>Your API Key</h3>
          <p className="my-7 w-4/5 description">
            Your API Key is given below. It is required to use our API. Keep it
            safe and secure. You can view and change it at any time.
          </p>
          {loading && (
            <LoadingBar
              color="#f74c41"
              progress={load}
              onLoaderFinished={() => {}}
            />
          )}
          <div className="flex justify-between">
            <div className="flex flex-col">
              <textarea
                name=""
                id=""
                value={api}
                cols="30"
                rows="5"
                style={{ fontFamily: "Raleway, sans-serif" }}
                className=" border border-gray-400 rounded-md py-2 px-4 mr-3 font-semibold tracking-widest"
              ></textarea>
              <div className="flex pr-2">
                {" "}
                <button
                  className="bg-bgblue py-1 px-4 rounded-md  w-3/6 mr-2 h-9 mt-8  text-white text-sm font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(api);
                  }}
                >
                  COPY KEY
                </button>
                <button
                  className="bg-bgblue text-white py-1 px-4 rounded-md ml-2  w-3/6 h-9 mt-8 text-sm font-medium"
                  onClick={resetApiKey}
                >
                  RESET KEY
                </button>
              </div>
            </div>
            <div
              className="w-5/12 flex flex-col justify-center h-full rounded p-3 text-sm"
              style={{
                backgroundColor: "rgba(247, 76, 65 , 0.05)",
                color: "rgba(247, 76, 65 , 0.6)",
              }}
            >
              <p className="font-semibold mb-4 text-sm">Note:</p>
              <ol className="font-light text-base">
                <li className="text-sm">
                  <span className="font-semibold" >1.</span >Don’t share the API
                  key with anyone
                </li>
                <li className="text-sm">
                  <span className="font-semibold">2.</span>In case you feel any
                  unauthorized access, change the key immediately
                </li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You should verify your email to generate an API key.
        </p>
      )}
    </div>
  );
}

export default ApiKey;
