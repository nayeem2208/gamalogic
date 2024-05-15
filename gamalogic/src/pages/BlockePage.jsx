import { Link } from 'react-router-dom'

function BlockePage() {
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center text-white">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
        <Link to="/">
          <p className="font-semibold text-2xl text-center">GAMALOGIC</p>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
            <div className="notfound flex flex-col justify-center items-center">
          <h3 className=" text-9xl font-bold">Blocked</h3>
          <h4 className="text-4xl font-semibold">Disposible or temporary email address are not allowed to register with our service. We prefer to use real email address</h4>
          <Link
          to="/signup"
          className="border rounded-xl px-4 mt-4 py-1 border-cyan-500 text-2xl"
        >
          Signup
        </Link>
          </div>
        
      </div>
    </div>
  )
}

export default BlockePage
