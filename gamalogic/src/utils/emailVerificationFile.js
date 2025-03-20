import * as XLSX from "xlsx";
import Papa from "papaparse";

// export const handleCSVFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
//     try {
//         setFileForClickUp(file);
//         Papa.parse(file, {
//             header: true,
//             skipEmptyLines: true,
//             complete: async function (results) {
//                 results.fileName = file.name;

//                 if (results.data.length <= 100000) {
//                     setJsonToServer(results);
//                     setShowAlert(true);
//                 } else {
//                     toast.error(
//                         "Please select a file with not more than 100,000 email address"
//                     );
//                 }
//             },
//         });
//         console.log('to the excel tabel')
//     } catch (error) {
//         console.error("Error uploading CSV file:", error);
//     }
// };

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const handleCSVFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    try {
        setFileForClickUp(file);
        Papa.parse(file, {
            header: false, // Parse without headers initially
            skipEmptyLines: true,
            complete: async function (results) {
                let data = results.data;

                // Check if the first row contains valid email addresses
                const firstRow = data[0];
                console.log(firstRow,'firstRow')
                const hasHeaders = !firstRow.some(cell => isValidEmail(cell));
                console.log(hasHeaders,'hasHeaders')
                if (!hasHeaders) {
                    // Add a dummy header if the first row contains emails
                    const dummyHeader = ["email"];
                    data = [dummyHeader, ...data];
                }

                // Convert to JSON with headers
                const parsedData = Papa.parse(Papa.unparse(data), {
                    header: true,
                    skipEmptyLines: true,
                }).data;

                const jsonData = {
                    data: parsedData, // Ensure the data is stored in the `data` property
                    fileName: file.name,
                };
                console.log(jsonData,'json dataaaaaaa')
                if (jsonData.data.length <= 100000) {
                    setJsonToServer(jsonData);
                    setShowAlert(true);
                } else {
                    toast.error("Please select a file with not more than 100,000 email addresses");
                }
            },
        });
    } catch (error) {
        console.error("Error uploading CSV file:", error);
    }
};

export const handleXLSXFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    setFileForClickUp(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Check if the first row contains valid email addresses
        const firstRow = rows[0];
        const hasHeaders = !firstRow.some(cell => isValidEmail(cell));

        let headers, contacts;
        if (!hasHeaders) {
            // Add a dummy header if the first row contains emails
            headers = ["email"];
            contacts = rows.map(row => ({ [headers[0]]: row[0] }));
        } else {
            // Use the first row as headers
            headers = rows[0].map(header => header.trim());
            contacts = rows.slice(1).map(row => {
                const contact = {};
                row.forEach((value, index) => {
                    contact[headers[index]] = value;
                });
                return contact;
            });
        }

        const fileName = file.name;
        if (contacts.length <= 100000 && contacts.length > 0) {
            setJsonToServer({ data: contacts, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error("Please select an Excel file with not more than 100,000 records.");
        }
    };

    reader.readAsArrayBuffer(file);
};

export const handleTXTFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    setFileForClickUp(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split("\n").filter(line => line.trim() !== "");

        // Check if the first line contains a valid email address
        const firstLine = lines[0];
        const hasHeaders = !isValidEmail(firstLine.trim());

        let headers, contacts;
        if (!hasHeaders) {
            // Add a dummy header if the first line contains an email
            headers = ["email"];
            contacts = lines.map(line => ({ [headers[0]]: line.trim() }));
        } else {
            // Use the first line as headers
            headers = lines[0].split(/\s+/).map(header => header.trim());
            contacts = lines.slice(1).map(line => {
                const values = line.split(/\s+/).map(item => item.trim());
                const contact = {};
                headers.forEach((header, index) => {
                    contact[header] = values[index] || "";
                });
                return contact;
            });
        }

        const fileName = file.name;
        if (contacts.length <= 100000) {
            setJsonToServer({ data: contacts, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error("Please select a file with not more than 100,000 email addresses");
        }
    };
    reader.readAsText(file);
};
// export const handleXLSXFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
//     setFileForClickUp(file);
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//         if (rows.length > 0) {
//             rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
//         }

//         // Extract and clean headers
//         const headers = rows[0].map((header) => header.trim());

//         // Map the rows to objects using the cleaned headers
//         const contacts = rows.slice(1).map((row) => {
//             const contact = {};
//             row.forEach((value, index) => {
//                 contact[headers[index]] = value;
//             });
//             return contact;
//         });

//         const fileName = file.name;
//         console.log(contacts, "contacts in xls");
//         if (contacts.length <= 100000 && contacts.length > 0) {
//             setJsonToServer({ data: contacts, fileName: fileName });
//             setShowAlert(true);
//         } else {
//             toast.error(
//                 "Please select an Excel file with not more than 100,000 records."
//             );
//         }
//     };

//     reader.readAsArrayBuffer(file);
//     // reader.onload = async (e) => {
//     //     const data = new Uint8Array(e.target.result);
//     //     const workbook = XLSX.read(data, { type: "array" });
//     //     const sheetName = workbook.SheetNames[0];
//     //     const sheet = workbook.Sheets[sheetName];
//     //     const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//     //     const emails = rows
//     //     // .filter((emailArray, index) => index !== 0 && emailArray[0] !== undefined) // Skip header row if present
//     //     // .map((emailArray) => {
//     //     //     return { emailid: emailArray[0] };
//     //     // });
//     //     const fileName = file.name;
//     //     if (emails.length <= 100001) {
//     //         setJsonToServer({ emails: emails, fileName: fileName });
//     //         setShowAlert(true);
//     //     } else {
//     //         toast.error(
//     //             "Please select a file with not more than 100,000 email addresses"
//     //         );
//     //     }
//     // };
//     // reader.readAsArrayBuffer(file);
// };

// export const handleTXTFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
//     setFileForClickUp(file);
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//         const text = e.target.result;
//         const lines = text.split("\n");
//         let err = false;

//         const headers = lines[0]
//             .split(/\s+/) // Split the first line by whitespace
//             .map((header) => header.trim()); // Trim each header

//         // Process the rest of the lines (skip the first line)
//         const contacts = lines
//             .slice(1) // Skip the first line (headers)
//             .filter((line) => line.trim() !== "") // Remove empty lines
//             .map((line) => {
//                 const values = line.split(/\s+/).map((item) => item.trim()); // Split each line by whitespace
//                 const contact = {};

//                 // Map values to headers (keys)
//                 headers.forEach((header, index) => {
//                     contact[header] = values[index] || ""; // Use empty string if value is missing
//                 });

//                 return contact;
//             });

//         if (err) {
//             toast.error(
//                 "Please upload a file with consistent column headers and values."
//             );
//             return;
//         }

//         const fileName = file.name;
//         if (contacts.length <= 100001) {
//             setJsonToServer({ data: contacts, fileName: fileName });
//             setShowAlert(true);
//         } else {
//             toast.error(
//                 "Please select a file with not more than 100,000 email addresses"
//             );
//         }
//     };
//     reader.readAsText(file);
// };
