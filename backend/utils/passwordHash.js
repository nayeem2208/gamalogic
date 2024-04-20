import axios from "axios"
import urls from "../ConstFiles/urls.js"

export const passwordHash=async(password)=>{
    try {
        let hasedPassword=await axios.get(`${urls.passwordUrl}/hashpassword?password=${password}`)
        return hasedPassword.data
    } catch (error) {
        console.log(error)
    }
}

export const verifyPassword=async(password,hashedPassword)=>{
    try {
        let hasedPassword=await axios.get(`${urls.passwordUrl}/hashverify?password=${password}&hash=${hashedPassword}`)
        return hasedPassword.data
    } catch (error) {
        console.log(error)
    }
}
