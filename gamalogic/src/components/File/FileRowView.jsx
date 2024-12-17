import React from "react";
import ViewMoreDetails from "./ViewMoreDetails";

function FileRowViewListing({
  data,
  onDownloadFile,

}) {
  return (
    <div className="mt-6">
      {data.length > 0 && (
        <div
          className={` singleTileAppearingDiv flex justify-center flex-wrap items-center  w-full`}
        >
          {data.map((file, index) => (
            <ViewMoreDetails
              key={index}
              data={file}
              onDownloadFile={onDownloadFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileRowViewListing;
