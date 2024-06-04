import  { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance, { APP } from '../axios/axiosInstance'
import { toast } from 'react-toastify'
import ServerError from '../pages/ServerError'

function ForgotPassword() {
  let [email,setEmail]=useState('')
  let [serverError, setServerError] = useState(false);

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Forgot Password | Beta Gamalogic";
    } else {
      document.title = "Forgot Password | Gamalogic";
    }
  }, []);

  const handleSubmit=async(e)=>{  
    e.preventDefault()
    try {
      let res=await axiosInstance.post('/forgotPassword',{email})
      toast.success(res.data?.message,)
      setEmail('')
    } catch (error) {
      if (error.response.status === 500) {
        setServerError(true); 
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  }

  if (serverError) {
    return <ServerError />; 
  }
  return (
    <div
    className="w-full flex justify-center items-center "
  >
    <div className="w-5/6 sm:w-4/6 md:w-5/6 lg:w-4/6 flex flex-col justify-center items-center">
      <div className="text-center auth" style={{ position: "relative" }}>
        <div className="h2-background" style={{ position: "absolute" }}>
          <div className="red"></div>
          <div className="blue"></div>
        </div>
        <h2 className="font-semibold text-2xl md:text-4xl">Reset you password</h2>
        <p className="my-12 description">
        We will send you a link to reset your password
        </p>
      </div>
      <div
        className="flex flex-col p-10 px-5 w-10/12 sm:w-5/6 md:w-3/6 lg:w-4/6 xl:w-3/6 mb-16"
        style={{ backgroundColor: "#161736" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col text-xs sm:text-sm">
          <label htmlFor="">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
            className="bg-transparent border border-cyan-400 rounded-md py-2 px-4 text-gray-400 my-1"
          />
          <div className="flex justify-center mt-8">
            <button
              className="bg-red-500 w-2/6 p-2 rounded-3xl"
              type="submit"
            >
              SEND
            </button>
          </div>
        </form>
        <div className="flex justify-center text-sm text-gray-300 mt-2">
          <Link to="/signin">
             Cancel
          </Link>
        </div>
      </div>
    </div>
  </div>
  )
}

export default ForgotPassword
