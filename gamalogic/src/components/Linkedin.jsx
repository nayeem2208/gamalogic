import React, { useState, useEffect } from 'react';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import linkedin from 'react-linkedin-login-oauth2/assets/linkedin.png';

function LinkedInPage(data) {
  const [code, setCode] = useState(null);
  const { linkedInLogin } = useLinkedIn({
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
    scope: 'email openid profile',
  });
  let clientid=import.meta.env.VITE_LINKEDIN_CLIENT_ID
  let url=`${window.location.origin}/${data.endpoint}`
  const handleLogin = () => {
    const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientid}&redirect_uri=${url}&scope=email+openid+profile`;
    window.location.href = authorizationUrl;
  };

  return (
    <img
      onClick={handleLogin}
      src={linkedin}
      alt="Sign in with Linked In"
      style={{ maxWidth: '180px', cursor: 'pointer' }}
    />
  );
}

export default LinkedInPage;

// import React, { useState, useEffect } from "react";
// import { useLinkedIn } from "react-linkedin-login-oauth2";
// import linkedin from "react-linkedin-login-oauth2/assets/linkedin.png";

// function LinkedInPage(data) {
//   console.log(data, "endpoint");
//   const [code, setCode] = useState(null);
//   const { linkedInLogin } = useLinkedIn({
//     clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
//     // redirectUri: 'http://localhost:5173/signup',
//     redirectUri: `${window.location.origin}/${data.endpoint}`,
//     scope: "email openid profile",
//     onSuccess: (receivedCode) => {
//       setCode(receivedCode);
//     },
//     onError: (error) => {
//       console.error("Error:", error);
//     },
//   });

//   useEffect(() => {
//     if (code) {
//       window.close();
//     }
//   }, [code]);

//   return (
//     <img
//       onClick={linkedInLogin}
//       src={linkedin}
//       alt="Sign in with Linked In"
//       style={{ maxWidth: "180px", cursor: "pointer" }}
//     />
//   );
// }

// export default LinkedInPage;
