// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import UserDetailsProvider from './context/userContext.jsx'
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from "@azure/msal-react";

const msalConfig = {
  auth: {
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
      authority:import.meta.env.VITE_MICROSOFT_AUTHORITY,
      redirectUri: '/', 
      postLogoutRedirectUri: '/'
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
    <UserDetailsProvider>
    <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </UserDetailsProvider>
    </BrowserRouter>
  // </React.StrictMode>,
)
