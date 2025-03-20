import React, { useEffect, useRef, useState } from "react";
import ViewMoreDetails from "./ViewMoreDetails";

function FileRowViewListing({ data, onDownloadFile, matchingFile }) {
  const fileRefs = useRef([]);
  let [alreadyMatched, setAlreadyMatched] = useState(false);

  useEffect(() => {
    if (matchingFile && !alreadyMatched) {
      const fileIndex = data.findIndex((file) => file.id === matchingFile.id);
      if (fileRefs.current[fileIndex]) {
        fileRefs.current[fileIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      setAlreadyMatched(true)
    }
  }, [matchingFile, data]);

  return (
    <div className="mt-6">
      {data.length > 0 && (
        <div
          className={` singleTileAppearingDiv flex justify-center flex-wrap items-center  w-full`}
        >
          {data.map((file, index) => (
            <div
              key={index}
              ref={(el) => (fileRefs.current[index] = el)}
              className={`w-full`}
            >
              <ViewMoreDetails data={file} onDownloadFile={onDownloadFile} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileRowViewListing;
