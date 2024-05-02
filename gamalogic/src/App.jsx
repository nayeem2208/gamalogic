import { useLocation } from "react-router-dom";
import "./App.css";
import Router from "./Routers/Router";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserState } from "./context/userContext";
import { Suspense } from "react";

function App() {
  let {userDetails}=useUserState()
  const location = useLocation();
  return (
    <div>
        <ToastContainer/>
        <Suspense  fallback={<div>Loading...</div>}>
      <div
        className="mainBody lg:flex h-full"

      >
        {location.pathname !== "/login" && location.pathname !== "/signup" && (
          <>
            <SideBar />
            <Header />
          </>
        )}

        <Router />
      </div>
      {userDetails&&<Footer/>}
      </Suspense>
    </div>
  );
}

export default App;
