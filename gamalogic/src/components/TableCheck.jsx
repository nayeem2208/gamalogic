"use client";
import React, { useEffect, useRef, useState } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { toast } from "react-toastify";
import { LuTable } from "react-icons/lu";

const Spreadsheet = ({ jsonData, onUpload, onCancel }) => {
  const spreadsheetRef = useRef(null);
  const currentFieldRef=useRef('')
  const [columns, setColumns] = useState([]); // Store column names dynamically
  const [formData, setFormData] = useState({
    firstNameField: "",
    lastNameField: "",
    domainField: "",
  });
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSelectingColumn, setIsSelectingColumn] = useState(false);
  const [currentField, setCurrentField] = useState("");
  useEffect(() => {
    if (
      spreadsheetRef.current &&
      jsonData &&
      jsonData.data &&
      jsonData.data.length > 0
    ) {
      // Extract rows and headers
      const rows = jsonData.data; // Access the `data` field in the jsonData
      const headers = Object.keys(rows[0]); // Get column headers dynamically
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const dynamicColumns = headers.map((header) => ({
        width: 200, // Adjust column width as needed
      }));

      const rowData = rows.map((row) => headers.map((header) => row[header]));
      const screenHeight = window.innerHeight;

      let minRow = rowData.length + 1000;
      if (!tableInstance) {
        const table = jspreadsheet(spreadsheetRef.current, {
          data: rowData,
          columns: dynamicColumns,
          tableOverflow: true,
          license: "MIT",
          minDimensions: [25, minRow], // Minimum dimensions for the table
          // lazyLoading: true, // Enable virtual scrolling
          // autoColumnWidth: false, // Disable auto column width for better performance
          // autoIncrement: true, // Enable auto-increment for rows and columns
          tableHeight: `${screenHeight - 190}px`,
          onselection: (instance, x1, y1, x2, y2) => {
            // Check if the selection is in the header row (y1 === 0)
            if (y1 === 0) {
              console.log(x1,'x1')
              const selectedColumnIndex = x1; // Get the selected column index
              const selectedColumnName = alphabet[selectedColumnIndex] || `Column ${selectedColumnIndex + 1}`; // Get the column name
              console.log(currentField,'current field in selection')
              console.log(currentFieldRef,'current field ref')
              // Save the selected column name
              setFormData((prev) => ({
                ...prev,
                [currentFieldRef.current]: selectedColumnName,
              }));
  
              // Notify the user
              // toast.success(`Column selected`);
              setIsSelectingColumn(false); // Disable column selection mode
            }
          },
        });

        // Set the table instance
        setTableInstance(table);
        const alphabetHeaders = headers.map(
          (_, index) => alphabet[index] || `Column ${index + 1}`
        );
        setColumns(alphabetHeaders);
        setOriginalHeaders(headers);

        // Ensure the spreadsheet container takes full width and height
        spreadsheetRef.current.style.width = "calc(100% - 25%)"; // Ensure it takes up remaining space
        spreadsheetRef.current.style.overflowX = "auto"; // Add horizontal scroll

        // Ensure the table inside the spreadsheet takes full width and height
        // const tableElement = spreadsheetRef.current.querySelector("table");
        // if (tableElement) {
        //   tableElement.style.width = "100%";
        //   tableElement.style.height = "100%";
        //   tableElement.style.tableLayout = "fixed"; // Ensures columns respect the width
        // }
      }
    }
  }, [jsonData, tableInstance,isSelectingColumn,currentField]);

  useEffect(() => {
    if (tableInstance) {
      const handleScroll = (e) => {
        const container = spreadsheetRef.current;
        if (!container) return;
        console.log(container, "containe");
        const {
          scrollLeft,
          scrollTop,
          scrollWidth,
          scrollHeight,
          clientWidth,
          clientHeight,
        } = container;

        // Expand columns when scrolling right
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          tableInstance.insertColumn();
        }
        console.log(
          scrollTop,
          clientHeight,
          scrollHeight,
          scrollTop + clientHeight,
          "insert row"
        );
        // Expand rows when scrolling down
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          tableInstance.insertRow();
        }
      };

      if (spreadsheetRef.current) {
        spreadsheetRef.current.addEventListener("scroll", handleScroll);
      }
      // const verticalScrollContainer =
      //   spreadsheetRef.current.querySelector(".jexcel_scroll");
      //   console.log(verticalScrollContainer,'vertical scroll container')
      // if (verticalScrollContainer) {
      //   console.log('inside vertical scroll')
      //   verticalScrollContainer.addEventListener("scroll", handleScroll);
      // }
      return () => {
        if (spreadsheetRef.current) {
          spreadsheetRef.current.removeEventListener("scroll", handleScroll);
        } // if (verticalScrollContainer) {
        //   verticalScrollContainer.removeEventListener("scroll", handleScroll);
        // }
      };
    }
  }, [tableInstance]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      const container = spreadsheetRef.current;
      if (!container) return;

      const { scrollLeft } = container;
      const cellSize = 20; // Adjust this based on your cell size

      switch (e.key) {
        case "ArrowRight":
          container.scrollLeft = scrollLeft + cellSize;
          break;
        case "ArrowLeft":
          container.scrollLeft = scrollLeft - cellSize;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleColumnSelect = (field) => {
    console.log(field,'fielddddddddddd')
    setIsSelectingColumn(true);
    setCurrentField(field);
    currentFieldRef.current=field
    toast.info("Click on the table to select a column.");
  };
  console.log(currentField,'current field ')

  const handleUpload = () => {
    // Pass the form data to the parent via the `onUpload` callback
    if (
      !formData.firstNameField ||
      !formData.lastNameField ||
      !formData.domainField
    ) {
      toast.error("Please select the columns");
      return;
    }
    const newFormData = {
      firstNameField: originalHeaders[columns.indexOf(formData.firstNameField)],
      lastNameField: originalHeaders[columns.indexOf(formData.lastNameField)],
      domainField: originalHeaders[columns.indexOf(formData.domainField)],
    };
    console.log(newFormData,'new formdata for updload')
    if (onUpload) onUpload(newFormData);
  };
  console.log(formData,'formData')
  const handleCancel = () => {
    setFormData({
      firstNameField: "",
      lastNameField: "",
      domainField: "",
    });
    // Notify the parent component using the `onCancel` callback
    if (spreadsheetRef.current) {
      // Notify the parent component using the `onCancel` callback
      if (onCancel) onCancel();
    }
  };

  return (
    <div className="mt-8 flex justify-between ">
      {/* Spreadsheet Container */}
      <div
        ref={spreadsheetRef}
        id="spreadsheet"
        className="flex-1 p-0 h-full shadow-md" // Ensure it takes up remaining space and full height
      ></div>

      {/* Field Mapping Form */}
      <div
        className="w-1/4 p-4 border border-gray-300  shadow-md "
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(225,227,240,0.7) 100%)",
        }}
      >
        <h3
          className="UploadYourFile text-xl mt-4  font-medium text-red-600 mb-4"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Map Your Fields
        </h3>

        {/* Dropdowns for Field Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-medium ">First Name Field:</label>
          <div className="flex  items-center ">
            <input
              type="text"
              className="w-3/6 h-8 border rounded px-2"
              value={formData.firstNameField}
              readOnly
            />
            <LuTable
              className="w-6 h-6 cursor-pointer ml-3"
              onClick={() => handleColumnSelect("firstNameField")}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Last Name Field:</label>
          
          <div className="flex  items-center ">
            <input
              type="text"
              className="w-3/6 h-8 border rounded px-2"
              value={formData.lastNameField}
              readOnly
            />
            <LuTable
              className="w-6 h-6 cursor-pointer ml-3"
              onClick={() => handleColumnSelect("lastNameField")}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Domain Field:</label>
      
          <div className="flex  items-center ">
            <input
              type="text"
              className="w-3/6 h-8 border rounded px-2"
              value={formData.domainField}
              readOnly
            />
            <LuTable
              className="w-6 h-6 cursor-pointer ml-3 "
              onClick={() => handleColumnSelect("domainField")}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex  gap-2 text-sm">
          <button
            onClick={handleCancel}
            class="font-semibold w-32 h-8 rounded bg-red-500 text-white relative overflow-hidden group z-10 hover:text-white duration-1000"
          >
            <span class="absolute bg-red-600 w-36 h-28 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span class="absolute bg-red-800 w-36 h-28 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Cancel
          </button>

          <button
            onClick={handleUpload}
            class="font-semibold w-32 h-8 rounded bg-emerald-600 text-white relative overflow-hidden group z-10 hover:text-white duration-1000"
          >
            <span class="absolute bg-emerald-700 w-36 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span class="absolute bg-emerald-900 w-36 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Upload
          </button>
        </div>
        <div
          style={{
            backgroundColor: "rgba(247, 76, 65 , 0.05)",
            color: "rgba(247, 76, 65 , 0.6)",
            
          }}
          className="mt-4 p-3  border border-orange-300 rounded-lg text-sm "
        >
          <p className=" items-center">
              Click the <strong>table icon </strong>next to a field and select
              the respective header from the spreadsheet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
