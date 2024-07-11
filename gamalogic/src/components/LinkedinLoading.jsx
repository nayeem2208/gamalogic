import React, { useState } from 'react'
import HashLoader from "react-spinners/HashLoader";
const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
function LinkedinLoading() {
    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("#1da6b8");
  return (
    <div className="sweet-loading ">
      <HashLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default LinkedinLoading
