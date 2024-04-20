import { useEffect, useState } from "react";
import SubHeader from "../components/SubHeader";
import axiosInstance from "../axios/axiosInstance";

function ApiKey() {
  let [api,setApi]=useState('')
  useEffect(()=>{
    async function fetchApikey(){
      try {
        let res=await axiosInstance.get('/getApiKey')
        setApi(res.data.apiKey)
      } catch (error) {
        console.log(error)
      } 
    }
    fetchApikey()
  },[])

  let resetApiKey=async(req,res)=>{
    try {
      let resetApiKey=await axiosInstance.get('/resetApiKey')
      setApi(resetApiKey.data.newApiKey)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"API Key"} />
      <div className="mt-14 subHeading">
        <h3>Your API Key</h3>
        <p className="my-7 w-4/5 description">
          Your API Key is given below. It is required to use our API. Keep it
          safe and secure. You can view and change it at any time.
        </p>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <textarea
              name=""
              id=""
              value={api}
              cols="40"
              rows="5"
              className="border border-gray-400 rounded-md py-2 px-4 mr-3"
            ></textarea>
            <div className="flex pr-2">
              {" "}
              <button className="bg-bgblue text-white py-1 px-4 rounded-md  w-3/6 mr-2 h-9 mt-8" onClick={() => {navigator.clipboard.writeText(api)}}>
                COPY KEY
              </button>
              <button className="bg-bgblue text-white py-1 px-4 rounded-md ml-2  w-3/6 h-9 mt-8" onClick={resetApiKey}>
                RESET KEY
              </button>
            </div>
          </div>
          <div
          className="w-5/12 flex flex-col justify-center h-full rounded p-3"
            style={{
              backgroundColor: "rgba(247, 76, 65 , 0.05)",
              color: "rgba(247, 76, 65 , 0.6)",
            }}
          >
            <p className="font-semibold mb-4">Note:</p>
            <ol className="font-light text-lg">
              <li><span className="font-semibold">1.</span>Don’t share the API key with anyone</li>
              <li>
              <span className="font-semibold">2.</span>In case you feel any unauthorized access, change the key
                immediately
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKey;
