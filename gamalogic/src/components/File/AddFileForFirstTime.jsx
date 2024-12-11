import React from "react";

function AddFileForFirstTime({ onUpload }) {
  return (
    <div className="flex flex-col justify-center items-center text-center  px-4 mt-6 md:mt-12">
      <div
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(225,227,240,0.7) 100%)",
        }}
        className=" lg:w-3/5 lg:max-w-3xl 2xl:mt-16 border-2 border-dashed bg-slate-100 hover:bg-slate-100  border-gray-300 rounded-lg p-10 w-full   shadow-lg"
      >
        <h3
          className="UploadYourFile text-3xl font-medium text-red-600 mb-4"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Upload Your File
        </h3>
        <p className="UploadYourFileDark  text-[13px]">
          You can upload your email list in one of the following formats:
        </p>
        <div className="flex justify-center ">
          <div className="flex flex-wrap w-3/5  justify-evenly my-4">
            <img src="/csv(8).png" alt="csvFile" className="w-10 m-1" />
            <img src="/xls(6).png" alt="xlsFile" className="w-10 m-1" />
            <img src="/xlsx(4).png" alt="xlsxFile" className="w-10 m-1" />
            <img src="/txt(7).png" alt="txtFile" className="w-10 m-1" />
          </div>
        </div>
        <p className="UploadYourFileDark  mb-6 text-[13px]">
          Drag and drop your file here or click the button below to select a
          file.
        </p>
        <button
          className="flex items-center justify-center w-full hover:bg-red-800 hover:text-red-400  text-red-600  border border-red-600 hover:border-red-500 py-3 px-6 rounded-lg font-medium   transition duration-300"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <span className="text-6xl mr-2 text-center">+</span>
        </button>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={onUpload}
        />
      </div>
    </div>
  );
}

export default AddFileForFirstTime;
