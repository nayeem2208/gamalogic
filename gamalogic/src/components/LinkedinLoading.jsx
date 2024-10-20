import React, { useState } from 'react'
import GridLoader from "react-spinners/GridLoader";
const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
function LinkedinLoading() {
    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("#1da6b8");
  return (
    <div className="sweet-loading flex justify-center items-center mt-32 ">
      <GridLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default LinkedinLoading
