"use client";
import React, { useEffect, useRef, useState } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { toast } from "react-toastify";
import { LuTable } from "react-icons/lu";

const Spreadsheet = ({ jsonData, onUpload, onCancel }) => {
  const spreadsheetRef = useRef(null);
  const currentFieldRef = useRef("");
  const [columns, setColumns] = useState([]); // Store column names dynamically
  const [formData, setFormData] = useState({
    firstNameField: "",
    lastNameField: "",
    domainField: "",
    defaultFirstNameField: "", // Store auto-detected default
    defaultLastNameField: "", // Store auto-detected default
    defaultDomainField: "", // Store auto-detected default
  });
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSelectingColumn, setIsSelectingColumn] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const fieldPatterns = {
    firstNameField: [
      "firstname",
      "first_name",
      "firstName",
      "first name",
      "fname",
      "givenname",
      "given name",
      "given_name",
      "first",
      "f_name",
      "first-name",
      "firstname1",
    ],
    lastNameField: [
      "lastname",
      "last_name",
      "lastName",
      "last name",
      "lname",
      "surname",
      "familyname",
      "family name",
      "family_name",
      "last",
      "l_name",
      "last-name",
    ],
    domainField: [
      "domain",
      "website",
      "companydomain",
      "company domain",
      "company_domain",
      "domainname",
      "domain name",
      "domain_name",
      "url",
      "web",
      "websiteurl",
      "website url",
      "website_url",
    ],
  };

  // Function to find the best matching column for a field type
  const findBestColumnMatch = (headers, fieldType) => {
    const patterns = fieldPatterns[fieldType];
    let bestMatch = null;
    let bestScore = 0;

    headers.forEach((header, index) => {
      const normalizedHeader = header.toString().toLowerCase().trim();

      // Check for exact matches first
      if (patterns.includes(normalizedHeader)) {
        bestMatch = index;
        bestScore = Infinity; // Highest possible score
        return;
      }

      // Check for partial matches
      patterns.forEach((pattern) => {
        if (normalizedHeader.includes(pattern)) {
          const score = pattern.length; // Longer patterns get higher score
          if (score > bestScore) {
            bestScore = score;
            bestMatch = index;
          }
        }
      });
    });

    return bestMatch;
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

      const tableData = [headers, ...rows];
      const screenHeight = window.innerHeight;

      let minRow = rows.length + 1000;
      if (!tableInstance) {
        const table = jspreadsheet(spreadsheetRef.current, {
          data: tableData,
          columns: dynamicColumns,
          tableOverflow: true,
          license: "MIT",
          minDimensions: [25, minRow], // Minimum dimensions for the table
          // lazyLoading: true, // Enable virtual scrolling
          // autoColumnWidth: false, // Disable auto column width for better performance
          // autoIncrement: true, // Enable auto-increment for rows and columns
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

        const detectedFields = {};
        Object.keys(fieldPatterns).forEach(fieldType => {
          const columnIndex = findBestColumnMatch(headers, fieldType);
          if (columnIndex !== null) {
            const columnLetter = alphabet[columnIndex] || `Column ${columnIndex + 1}`;
            detectedFields[fieldType] = columnLetter;
            detectedFields[`default${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`] = columnLetter;
          }
        });

        setFormData((prev) => ({ ...prev, ...detectedFields }));
        // Ensure the spreadsheet container takes full width and height
        spreadsheetRef.current.style.width = "calc(100% - 25%)"; // Ensure it takes up remaining space
        spreadsheetRef.current.style.overflowX = "auto"; // Add horizontal scroll
      }
    }
  }, [jsonData, tableInstance, isSelectingColumn, currentField]);

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
    if (!selectedColumn) {
      toast.error("Please select a column to choose");
      return;
    }
      // Update the form data with the selected key
    setFormData((prev) => ({
      ...prev,
      [field]: selectedColumn,
    }));
  
    setSelectedColumn("");
  };

  const handleUpload = () => {
    if (!formData.firstNameField || !formData.lastNameField || !formData.domainField) {
      toast.error("Please select all required columns");
      return;
    }

    const newFormData = {
      firstNameField: [
        originalHeaders[columns.indexOf(formData.firstNameField)],
        formData.firstNameField,
        formData.defaultFirstNameField // Include default value
      ],
      lastNameField: [
        originalHeaders[columns.indexOf(formData.lastNameField)],
        formData.lastNameField,
        formData.defaultLastNameField // Include default value
      ],
      domainField: [
        originalHeaders[columns.indexOf(formData.domainField)],
        formData.domainField,
        formData.defaultDomainField // Include default value
      ],
    };

    console.log("Uploading data:", newFormData);
    if (onUpload) onUpload(newFormData);
  };
  const handleCancel = () => {
    setFormData({
      firstNameField: "",
      lastNameField: "",
      domainField: "",
      // emailField:""
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
        {/* <div className="mb-4">
          <label className="block mb-2 font-medium">
            Email Field (Output Location):
          </label>
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
        </div> */}

        {/* Buttons */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={handleCancel}
            className="font-semibold w-32 h-8 rounded overflow-hidden bg-red-500 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }} // Add clip-path to contain the animation
          >
            <span className="absolute bg-red-600 w-36 h-24 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-red-800 w-36 h-24 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="font-semibold w-32 h-8 rounded overflow-hidden bg-emerald-600 text-white relative group z-10 hover:text-white duration-1000"
            style={{ clipPath: "inset(0 0 0 0)" }} // Add clip-path to contain the animation
          >
            <span className="absolute bg-emerald-700 w-36 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
            <span className="absolute bg-emerald-900 w-36 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
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
          <p className="items-center">
            First, select the respective header from the spreadsheet, then click
            the <strong>table icon</strong> next to a field.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
