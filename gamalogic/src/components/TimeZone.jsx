import React, { useState } from "react";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";

const CustomTimeZoneSelect = ({ selectedTimezone, setSelectedTimezone }) => {
  const labelStyle = "original";
  const timezones = {
    ...allTimezones,
    "Europe/Berlin": "Frankfurt",
  };

  const { options, parseTimezone } = useTimezoneSelect({ labelStyle, timezones });

  const handleChange = (e) => {
    const parsedTimezone = parseTimezone(e.target.value);
    setSelectedTimezone(parsedTimezone);
  };

  return (
    <div>
      <p className="mt-6 mb-1 text-sm">Timezone</p>
      <select
        id="timezone-select"
        className="input-box"
        value={selectedTimezone?.value || ""}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

function TimeZone() {
  const [selectedTimezone, setSelectedTimezone] = useState(null);

  const handleUpdateTimezone = async () => {
    if (!selectedTimezone) {
      alert("Please select a timezone.");
      return;
    }

    try {
        console.log(selectedTimezone,'selected timezone')
      const response = await axiosInstance.post("/update-timezone", {
        timezone: selectedTimezone.value, 
      });
      console.log("Response from backend:", response.data);
      toast.success("Timezone updated successfully!");
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone. Please try again.");
    }
  };

  return (
    <div className="subHeading mt-14 border-t-2 py-8">
      <h3>Please select your timezone</h3>
      <div className="select-wrapper my-5">
        <CustomTimeZoneSelect
          selectedTimezone={selectedTimezone}
          setSelectedTimezone={setSelectedTimezone}
        />
      </div>
      <button
        onClick={handleUpdateTimezone}
        className="bg-bgblue hover:bg-slate-700 transition-all text-white py-2 px-4 rounded-md mt-6 text-sm font-medium"
      >
        UPDATE TIMEZONE
      </button>
    </div>
  );
}

export default TimeZone;
