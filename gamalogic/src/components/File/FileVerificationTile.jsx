import React from "react";
import SingleTile from "./SingleTile";
import InfiniteScroll from "react-infinite-scroll-component";
import MoreFileLoader from "../MoreFileLoader";
import AddNewFileTile from "./AddnewFile";

function FileVerificationTile({ data,fetchMoreFiles,hasMore ,onDownloadFile,onUpload}) {

  return (
    <div className="mt-6">
      {data.length > 0 && (
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMoreFiles}
          hasMore={hasMore}
          height={650}
          loader={
            data.length >= 4 && (
              <div className="w-full mt-4  flex justify-center items-center">
                <MoreFileLoader />
              </div>
            )
          }
        >
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3   justify-center md:justify-normal w-full 2xl:w-4/5">
          <AddNewFileTile onAddFile={onUpload}/>
            {data.map((file, index) => (
              <SingleTile key={index} data={file} onDownloadFile={onDownloadFile} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default FileVerificationTile;
