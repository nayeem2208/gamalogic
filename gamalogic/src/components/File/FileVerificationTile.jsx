import React from "react";
import SingleTile from "./SingleTile";
import AddNewFileTile from "./AddnewFile";

function FileVerificationTile({
  data,
  onDownloadFile,
  onUpload,
}) {
  return (
    <div className="mt-6">
      {data.length > 0 && (
        <div
          className={` singleTileAppearingDiv flex justify-center md:justify-normal lg:justify-evenly  items-center flex-wrap   w-full`}
        >
          <AddNewFileTile onAddFile={onUpload} />
          {data.map((file, index) => (
            <SingleTile
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

export default FileVerificationTile;
