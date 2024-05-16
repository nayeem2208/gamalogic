import React from 'react'
import { Link } from 'react-router-dom'

function ServerError() {
    const refreshPage = () => {
        window.location.reload();
      };
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center text-white">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
            <div className="notfound flex flex-col justify-center items-center">
          <h1 className=" text-9xl font-bold">500</h1>
          <h2 className="text-4xl font-semibold">PAGE NOT FOUND</h2>
          <button
          className="border rounded-xl px-4 mt-4 py-1 border-cyan-500 text-xl"
          onClick={refreshPage}
        >
          Refresh Page
        </button>
          </div>
        
      </div>
    </div>
  )
}

export default ServerError
