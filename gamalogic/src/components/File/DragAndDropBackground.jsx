import React from "react";
import { LuFileUp } from "react-icons/lu";

function DragAndDropBackground() {
  return (
    <div
      className="absolute z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none"
      style={{
        transition: "opacity 0.3s ease",
        backdropFilter: "blur(15px)",
      }}
    >
      <div className="w-4/5 lg:w-3/5 h-96 bg-gray-900 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 p-6 border-4 border-dashed border-gray-700">
        <LuFileUp className="text-teal-800 mt-2 mx-2 w-14 h-14" />
        <p className="text-gray-600 text-center">Drag & Drop your files here</p>

        <p className="text-sm text-gray-400">
          Supported formats:{" "}
        </p>
        <div className="flex justify-center w-2/6 max-w-72">
          <div className="flex flex-wrap w-full  justify-evenly ">
            <img src="/csv.png" alt="csvFile" className="w-6 md:w-8 m-1" />
            <img src="/xls.png" alt="xlsFile" className="w-6 md:w-8 m-1" />
            <img src="/xlsx.png" alt="xlsxFile" className="w-6 md:w-8 m-1" />
            <img src="/txt.png" alt="txtFile" className="w-6 md:w-8 m-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DragAndDropBackground;
