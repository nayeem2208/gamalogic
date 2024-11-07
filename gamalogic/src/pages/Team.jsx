import React, { useEffect, useState } from "react";
import { useUserState } from "../context/userContext";
import SubHeader from "../components/SubHeader";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ManageTeam from "../components/Team/ManageTeam";

function Team() {
  let location=useLocation()
  let { setUserDetails, userDetails } = useUserState();

  
  useEffect(()=>{
    const searchParams = new URLSearchParams(location.search);
    const team = new URLSearchParams(location.search).get("team");
    if(team){
      const storedToken = localStorage.getItem("Gamalogic_token");
      if (storedToken) {
        let token;
        try {
          token = JSON.parse(storedToken);
        } catch (error) {
          token = storedToken;
        }
        token.isTeam = true;
        localStorage.setItem("Gamalogic_token", JSON.stringify(token));
        setUserDetails(token);
      }
      toast.success('Team creation has succesfully completed')
    }
    searchParams.delete("team");

  },[])

  return (
    <div className="px-6 md:px-20 py-8 accountSettings text-center sm:text-start overflow-hidden">
      <SubHeader SubHeader={"Team"} />
      {userDetails.confirm == 1 ? (
        <div className="subHeading">
         <ManageTeam /> 
        </div>
      ) : (
        <p className="my-10 text-red-600 font-semibold text-lg">
          You must verify your email to view and manage account settings.
        </p>
      )}
    </div>
  );
}

export default Team;
