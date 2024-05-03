import { useLocation } from "react-router-dom";
import "./App.css";
import Router from "./Routers/Router";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Footer from "./components/Footer";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserState } from "./context/userContext";
import { Suspense, useState } from "react";
import TopLoader from "./components/TopLoader";

function App() {
  let {userDetails}=useUserState()
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  return (
    <div>
        <ToastContainer/>
        <Suspense  fallback={<TopLoader loading={loading} />}>
      <div
        className="mainBody lg:flex h-full"
        setLoading={setLoading}
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
