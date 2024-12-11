import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

function AddNewFileTile({ onAddFile }) {
  return (
    <div
      className="shadow-xl hover:shadow-2xl flex flex-col justify-center items-center rounded-2xl md:w-64 md:max-w-64 lg:w-64 lg:max-w-64 2xl:w-72 2xl:max-w-72  m-6 cursor-pointer"
      style={{
        background:
          "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
      }}
      onClick={() => document.getElementById("fileInput").click()}

    >
      <div
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(225,227,240,0.7) 100%)",
        }}
        className="w-full h-full flex flex-col justify-center items-center text-center  border-2 border-dashed bg-slate-100 hover:bg-slate-100  border-gray-300 rounded-lg p-3   shadow-lg"
      >
        <h3
          className="UploadYourFile text-xl font-medium text-red-600 mb-3"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Upload Your File
        </h3>
        <p className="UploadYourFileDark text-[10px]  md:text-xs">
          You can upload your email list in one of the following formats:
        </p>
        <div className="flex justify-center ">
          <div className="flex flex-wrap w-full  justify-evenly my-4">
            <img src="/csv(8).png" alt="csvFile" className="w-6 md:w-8 m-1" />
            <img src="/xls(6).png" alt="xlsFile" className="w-6 md:w-8 m-1" />
            <img src="/xlsx(4).png" alt="xlsxFile" className="w-6 md:w-8 m-1" />
            <img src="/txt(7).png" alt="txtFile" className="w-6 md:w-8 m-1" />
          </div>
        </div>
        <p className="UploadYourFileDark  mb-6 text-[10px]  md:text-xs">
          Drag and drop your file here or click the button below to select a
          file.
        </p>
        <button
          className="flex items-center justify-center w-full rounded-lg font-medium   transition duration-300"
          // onClick={() => document.getElementById("fileInput").click()}
        >
          <div
            className="flex justify-center items-center w-20 h-20 md:w-28 md:h-28 text-red-500  hover:bg-red-200 hover:text-red-100"
            style={{
              border: "2px dashed #f53b3b",
              borderRadius: "50%",
            }}
          >
            <AiOutlinePlus className=" w-8 h-8 md:w-12 md:h-12 " />
          </div>
        </button>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={onAddFile}
        />
      </div>
    </div>
  );
}

export default AddNewFileTile;
