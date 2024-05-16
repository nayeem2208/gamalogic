import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserState } from "../context/userContext";
import axiosInstance from "../axios/axiosInstance";

function Body() {
  let navigate = useNavigate();
  let { setUserDetails, userDetails, setCreditBal, creditBal } = useUserState();
  useEffect(() => {
    const storedToken = localStorage.getItem("Gamalogic_token");
    if (storedToken) {
      let parsedToken;
      try {
        parsedToken = JSON.parse(storedToken);
      } catch (error) {
        parsedToken = storedToken;
      }
      setUserDetails(parsedToken);
    } else {
      setUserDetails(null);
      navigate("/signin");
    }
  }, [navigate]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/getCreditBalance");
        setCreditBal(response.data);
      } catch (error) {
        console.error("Error fetching credit balance:", error);
      }
    };
  
      fetchData();
  }, [creditBal]);
  return (
    <div className="w-full h-screen overflow-y-auto pb-12">
      {userDetails && <Outlet />}
    </div>
  );
}

export default Body;
