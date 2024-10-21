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
        if (error.response && error.response.status === 401 && error.response.data.error === "TokenExpired") {
          localStorage.removeItem('Gamalogic_token');
          setUserDetails(null)
          toast.error(error.response.data.message);
          navigate("/signin");
        }
        console.error("Error fetching credit balance:", error);
      }
    };
  
      fetchData();
  }, [creditBal]);

  // useEffect(()=>{
  //   console.log('heyyyyyoooo')
  //   async function fetchThriveDigest(){
  //     let user=await axiosInstance.get('/affiliateUserId')
  //     console.log(user,'user is here')
  //     window.ztUserData = window.ztUserData || {}; 
  //     window.ztUserData['za_email_id'] = user.data.user.emailid;  
  //     window.ztUserData['user_unique_id'] =user.data.user.rowid;
  //     window.ztUserData['thrive_digest'] = user.data.HMACDigest;
  //     window.ztUserData['signUpPage'] = 'https://beta.gamalogic.com/signup';
  //     window.ztUserData['signInPage'] = 'https://beta.gamalogic.com/signin';
  //     // window.ztUserData['ztWidgetDelay'] = 0;
  //     console.log(window.ztUserData,'window zt user dataaaaaaaa')

  //     // const script = document.createElement('script');
  //     // script.id = 'thrive_script';
  //     // script.src = 'https://thrive.zohopublic.com/thrive/publicpages/thrivewidget';
  //     // document.body.appendChild(script);
  //   }
  //   fetchThriveDigest()


  // },[userDetails])
  return (
    <div className="w-full h-screen overflow-y-auto pb-12">
      {userDetails && <Outlet />}
    </div>
  );
}

export default Body;
