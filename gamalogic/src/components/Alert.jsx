import React from 'react';

function Alert({ sizeOfData,onAccept, onDismiss }) {
  const handleAccept = () => {
    if (typeof onAccept === 'function') {
      onAccept(true);
    }
    // setSelection(true); // Update selection state on accept
  };
  
  const handleDismiss = () => {
    if (typeof onDismiss === 'function') {
      onDismiss(false);
    }
    // setSelection(false); // Update selection state on dismiss
  };
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-lg border border-stone bg-slate-200 p-4 shadow-xl sm:p-6 lg:p-8 absolute">
      <div className="flex items-center gap-4">
        <span className="shrink-0 rounded-full bg-bgblue p-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd"></path>
          </svg>
        </span>

        <p className="font-medium sm:text-lg text-red-500">New notification!</p>
      </div>

      <p className="mt-4 text-gray-600">
      Generating the data might take some time due to its size ({sizeOfData.data.length} records). Are you sure you want to proceed?      </p>

      <div className="mt-6 sm:flex sm:gap-4">
        <button className="inline-block w-full rounded-lg bg-bgblue px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto" onClick={handleAccept}>
          Accept
        </button>

        <button className="mt-2 inline-block w-full rounded-lg bg-stone-300 px-5 py-3 text-center text-sm font-semibold text-gray-800 sm:mt-0 sm:w-auto" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default Alert;
