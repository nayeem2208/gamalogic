import  { createContext, useContext, useState } from "react";
import PropTypes from 'prop-types';

const userDetailsContext = createContext();

const UserDetailsProvider = ({ children }) => {
  let [userDetails, setUserDetails] = useState(null);
  let [creditBal,setCreditBal]=useState(0)

  return (
    <userDetailsContext.Provider
      value={{
        userDetails,
        setUserDetails,
        creditBal,
        setCreditBal
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