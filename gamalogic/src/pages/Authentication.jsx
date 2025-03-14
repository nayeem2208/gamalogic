import  { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useUserState } from '../context/userContext';

function Authentication() {
  let navigate = useNavigate();
  let { setUserDetails,userDetails} = useUserState();
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
          navigate('/')
        }
        // window.hideThriveWidget = false;
        //   window.reloadThriveWidget();
    }, []);
  
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {!userDetails&&
    <div className='bg-bgblue w-full h-screen text-white overflow-y-auto'>
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue ">
       <Link to='/'><p className="font-semibold text-xl text-center sm:ml-11">GAMALOGIC</p></Link> 
      </div>
     
      <div className='flex justify-center items-center  mt-36 lg:mt-60' ><Outlet/></div>
    </div>}
    </GoogleOAuthProvider>
  )
}

export default Authentication
