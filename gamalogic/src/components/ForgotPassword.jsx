import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../axios/axiosInstance'
import { toast } from 'react-toastify'

function ForgotPassword() {
  let [email,setEmail]=useState('')
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
      console.log('ivda vare ok')
      let res=await axiosInstance.post('/forgotPassword',{email})
      toast.dark(res.data?.message)
      setEmail('')
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.error)
    }
  }
  return (
    <div
    className="w-full flex justify-center items-center "
    style={{ marginTop: "10vw" }}
  >
    <div className="w-3/5 flex flex-col justify-center items-center">
      <div className="text-center auth" style={{ position: "relative" }}>
        <div className="h2-background" style={{ position: "absolute" }}>
          <div className="red"></div>
          <div className="blue"></div>
        </div>
        <h2 className="font-semibold text-4xl">Reset you password</h2>
        <p className="my-12 description">
        We'll send you a link to reset your password
        </p>
      </div>
      <div
        className="flex flex-col p-10 w-3/6 mb-16"
        style={{ backgroundColor: "#161736" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
            className="bg-transparent border border-cyan-400 rounded-md py-1 px-4 text-gray-400 my-1"
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
