import React from "react";
import { RxDividerVertical } from "react-icons/rx";
import { FaList } from "react-icons/fa6";
import { PiSquaresFourFill } from "react-icons/pi";

function ViewSelector({ tileView, onViewChange }) {
  return (
    <div className=" flex shadow rounded-md  md:mt-0 2xl:mr-20  max-w-32 md:max-w-48 py-2 justify-center items-center">
      <div className="flex justify-center items-center w-12 " onClick={() => onViewChange("tile")}>
        <PiSquaresFourFill
          
          className={`w-5 h-5 ${tileView ? "text-red-500" : "text-bgblue"}`}
        />
      </div>
      <RxDividerVertical className="w-5 h-5" />
      <div className="flex justify-center items-center w-12 "  onClick={() => onViewChange("nonTile")}>
        <FaList
         
          className={`w-5 h-5  ${!tileView ? "text-red-500" : "text-bgblue"}`}
        />
      </div>
    </div>
  );
}

export default ViewSelector;
