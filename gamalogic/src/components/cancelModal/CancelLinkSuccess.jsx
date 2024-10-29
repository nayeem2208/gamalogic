import React from 'react';

function CancelEmailSuccess({ onOkay }) {


  const handleOkay = () => {
    console.log('ivda ethi')
    if (typeof onOkay === 'function') {
      onOkay();
    }
  };

  return (
    <div className="fixed inset-0 lg:left-[22vw] 2xl:left-[17vw] top-[-20px] z-50 flex items-center justify-center">
      <div role="alert" aria-labelledby="alert-title" aria-describedby="alert-description" className="mx-auto max-w-lg rounded-lg border border-stone bg-slate-200 p-4 shadow-xl sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <span className="shrink-0 rounded-full bg-bgblue p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd"></path>
            </svg>
          </span>

          <p id="alert-title" className="font-medium sm:text-lg text-red-500">Verification Link Sent!</p>
        </div>
        <p id="alert-description" className='mt-4'>A verification link has been sent to your email. Please click the link to confirm your cancellation.</p>
        <div className="mt-6 sm:flex sm:gap-4">
          <button className="inline-block w-full rounded-lg hover:bg-red-500 bg-bgblue px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto" onClick={handleOkay}>
            OKAY
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelEmailSuccess;
