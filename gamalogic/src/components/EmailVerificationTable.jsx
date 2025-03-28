"use client";
import React, { useEffect, useRef, useState } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { toast } from "react-toastify";
import { LuTable } from "react-icons/lu";

const ValidationSpreadsheet = ({ jsonData, onUpload, onCancel }) => {
  const spreadsheetRef = useRef(null);
  const [columns, setColumns] = useState([]); // Store column names dynamically
  const [formData, setFormData] = useState({
    initialField: "",
    emailField: "",
  });
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Common mobile breakpoint
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Function to detect email column
  const detectEmailColumn = (tableData, headers) => {
    if (!tableData || tableData.length < 2) return null;

    // Take first 10 rows (excluding header)
    const sampleRows = tableData.slice(1, Math.min(11, tableData.length));

    // Count email matches per column
    const columnMatches = headers.map((_, colIndex) => {
      let matchCount = 0;
      sampleRows.forEach((row) => {
        const cellValue = row[colIndex]?.toString().trim();
        if (cellValue && emailRegex.test(cellValue)) {
          matchCount++;
        }
      });
      return matchCount;
    });

    // Find column with highest match count
    const maxMatches = Math.max(...columnMatches);
    if (maxMatches === 0) return null; // No email columns found

    // Get all columns with max matches (in case of tie)
    const candidateColumns = columnMatches
      .map((count, index) => ({ count, index }))
      .filter((item) => item.count === maxMatches)
      .map((item) => item.index);

    // If only one candidate, return it
    if (candidateColumns.length === 1) {
      return candidateColumns[0];
    }

    // If multiple candidates with same match count, pick the first one
    return candidateColumns[0];
  };

  useEffect(() => {
    if (
      spreadsheetRef.current &&
      jsonData &&
      jsonData.data &&
      jsonData.data.length > 0
    ) {
      // Extract rows and headers
      const headers = jsonData.data[0]; // Get column headers dynamically
      const rows = jsonData.data.slice(1); // Access the `data` field in the jsonData
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const dynamicColumns = headers.map((header) => ({
        width: 200, // Adjust column width as needed
      }));

      // const rowData = rows.map((row) => headers.map((header) => row[header]));
      const tableData = [headers, ...rows];
      const screenHeight = window.innerHeight;
      // console.log('second stage in excel')
      let minRow = rows.length + 1000;
      if (!tableInstance) {
        const table = jspreadsheet(spreadsheetRef.current, {
          data: tableData,
          columns: dynamicColumns,
          tableOverflow: true,
          license: "MIT",
          lazyLoading: true,
          minDimensions: [25, minRow], // Minimum dimensions for the table
          tableHeight: `${screenHeight - 190}px`,
          onselection: (instance, x1, y1, x2, y2) => {
            if (y1 === 0) {
              const selectedColumnIndex = x1;
              const selectedColumnName =
                alphabet[selectedColumnIndex] ||
                `Column ${selectedColumnIndex + 1}`;
              setSelectedColumn(selectedColumnName);
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

        const emailColumnIndex = detectEmailColumn(tableData, headers);
        if (emailColumnIndex !== null) {
          const emailColumnLetter =
            alphabet[emailColumnIndex] || `Column ${emailColumnIndex + 1}`;
          setFormData({
            initialField: emailColumnLetter,
            emailField: emailColumnLetter,
          });
          setSelectedColumn(emailColumnLetter);
        }

        spreadsheetRef.current.style.width = "calc(100% - 25%)";
        spreadsheetRef.current.style.overflowX = "auto";
      }
    }
  }, [jsonData, tableInstance]);
  useEffect(() => {
    const container = spreadsheetRef.current;
    if (isMobile) {
      container.style.width = "calc(100%)";
    }
  }, [isMobile]);
  console.log(isMobile, "isMobile");
  useEffect(() => {
    if (tableInstance) {
      const handleScroll = (e) => {
        const container = spreadsheetRef.current;
        if (!container) return;

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

        // Expand rows when scrolling down
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          tableInstance.insertRow();
        }
      };

      if (spreadsheetRef.current) {
        spreadsheetRef.current.addEventListener("scroll", handleScroll);
      }
      return () => {
        if (spreadsheetRef.current) {
          spreadsheetRef.current.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [tableInstance]);

  const handleColumnSelect = (field) => {
    if (!selectedColumn) {
      toast.error("Please select a column to choose");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: selectedColumn,
    }));
    setSelectedColumn("");
  };

  const handleUpload = () => {
    // Validate if the email field is selected
    if (!formData.emailField) {
      toast.error("Please select the email column");
      return;
    }

    // Prepare the data to be sent to the parent component
    const newFormData = {
      initialField: [
        originalHeaders[columns.indexOf(formData.initialField)],
        formData.initialField,
      ],
      emailField: [
        originalHeaders[columns.indexOf(formData.emailField)],
        formData.emailField,
      ],
    };

    if (onUpload) onUpload(newFormData);
  };

  const handleCancel = () => {
    setFormData({
      emailField: "",
    });
    if (onCancel) onCancel();
  };

  return (
    <div className="sm:mt-5 sm:flex justify-between">
      {/* Mapping div on mobile screeen */}
      <div
        className="w-full p-2 sm:hidden border border-gray-300 shadow-md"
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(225,227,240,0.7) 100%)",
        }}
      >
        <h3
          className="UploadYourFile text-md mt-1 font-medium text-red-600 mb-2"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Map Your Field
        </h3>

        {/* Dropdown for Email Field Selection */}
        <div className="mb-4 flex justify-center items-center">
          <label className="block text-sm font-medium  w-2/5">Email Field:</label>
          <div className="flex items-center  ml-2">
            <input
              type="text"
              className="w-4/6 h-6 border text-sm rounded px-2"
              value={formData.emailField}
              readOnly
            />
            <LuTable
              className="w-5 h-5 cursor-pointer ml-3"
              onClick={() => handleColumnSelect("emailField")}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 text-xs justify-center">
          <button
            onClick={handleCancel}
            className="font-semibold w-28 h-6 rounded overflow-hidden bg-red-500 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <span className="absolute bg-red-600 w-36 h-24 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-red-800 w-36 h-24 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="font-semibold w-28 h-6 rounded overflow-hidden bg-emerald-600 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <span className="absolute bg-emerald-700 w-36 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-emerald-900 w-36 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Upload
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            backgroundColor: "rgba(247, 76, 65 , 0.05)",
            color: "rgba(247, 76, 65 , 0.6)",
          }}
          className="mt-2 p-3 border border-orange-300 rounded-lg text-xs"
        >
          <p className="items-center">
            First, select the respective header from the spreadsheet, then click
            the <strong>table icon</strong> next to the email field.
          </p>
        </div>
      </div>
      <div
        ref={spreadsheetRef}
        id="spreadsheet"
        className="flex-1 p-0 h-full shadow-md"
      ></div>

      {/* Field Mapping Form */}
      <div
        className="w-1/4 p-4 hidden sm:block border border-gray-300 shadow-md"
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.7) 0%, rgba(225,227,240,0.7) 100%)",
        }}
      >
        <h3
          className="UploadYourFile text-xl mt-4 font-medium text-red-600 mb-4"
          style={{ fontFamily: "Ubuntu, sans-serif" }}
        >
          Map Your Field
        </h3>

        {/* Dropdown for Email Field Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email Field:</label>
          <div className="flex items-center">
            <input
              type="text"
              className="w-3/6 h-8 border rounded px-2"
              value={formData.emailField}
              readOnly
            />
            <LuTable
              className="w-6 h-6 cursor-pointer ml-3"
              onClick={() => handleColumnSelect("emailField")}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={handleCancel}
            className="font-semibold w-32 h-8 rounded overflow-hidden bg-red-500 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <span className="absolute bg-red-600 w-36 h-24 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-red-800 w-36 h-24 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="font-semibold w-32 h-8 rounded overflow-hidden bg-emerald-600 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <span className="absolute bg-emerald-700 w-36 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-emerald-900 w-36 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Upload
          </button>
        </div>

        {/* Instructions */}
        <div
          style={{
            backgroundColor: "rgba(247, 76, 65 , 0.05)",
            color: "rgba(247, 76, 65 , 0.6)",
          }}
          className="mt-4 p-3 border border-orange-300 rounded-lg text-sm"
        >
          <p className="items-center">
            First, select the respective header from the spreadsheet, then click
            the <strong>table icon</strong> next to the email field.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationSpreadsheet;
