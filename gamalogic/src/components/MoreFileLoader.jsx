import React, { useState } from 'react'
import GridLoader from "react-spinners/GridLoader";
const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

function MoreFileLoader() {
    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("#0A0E2B");
  return (
    <div className="sweet-loading flex justify-center items-center  ">
      <GridLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={10}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default MoreFileLoader
