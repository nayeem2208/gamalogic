import  { createContext, useContext, useState } from "react";
import PropTypes from 'prop-types';

const userDetailsContext = createContext();

const UserDetailsProvider = ({ children }) => {
  let [userDetails, setUserDetails] = useState(null);
  let [creditBal,setCreditBal]=useState(0)
  let [tutorialVideo,setTutorialVideo]=useState(false)
  let [paymentResult,setPaymentResult]=useState({result:null,methord:null})
  let [linkedinLoading, setLinkedinLoading] = useState(false);
  let [paymentDetails,setPaymentDetails]=useState({cost:7,type:'Pay As You Go',period:'',credits:1000})
  let [accountDetailsModal,setAccountDetailsModal]=useState(false)
  let [appTour,setAppTour]=useState(null)
  let [notification,setNotification]=useState([])
  let [newNotification,setNewNotification]=useState(0)

  return (
    <userDetailsContext.Provider
      value={{
        userDetails,
        setUserDetails,
        creditBal,
        setCreditBal,
        tutorialVideo,
        setTutorialVideo,
        paymentResult,
        setPaymentResult,
        linkedinLoading,
        setLinkedinLoading,
        paymentDetails,
        setPaymentDetails,
        accountDetailsModal,
        setAccountDetailsModal,
        appTour,
        setAppTour,
        notification,
        setNotification,
        newNotification,
        setNewNotification
      }}
    >
      {children}
    </userDetailsContext.Provider>
  );
};

UserDetailsProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  

export const useUserState  = () => {
  return useContext(userDetailsContext);
};

export default UserDetailsProvider;