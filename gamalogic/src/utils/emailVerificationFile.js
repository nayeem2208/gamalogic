import * as XLSX from "xlsx";
import Papa from "papaparse";

export const handleCSVFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    try {
        setFileForClickUp(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                results.fileName = file.name;

                if (results.data.length <= 100000) {
                    setJsonToServer(results);
                    setShowAlert(true);
                } else {
                    toast.error(
                        "Please select a file with not more than 100,000 email address"
                    );
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
        if (rows.length > 0) {
            rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
        }

        // Extract and clean headers
        const headers = rows[0].map((header) => header.trim());

        // Map the rows to objects using the cleaned headers
        const contacts = rows.slice(1).map((row) => {
            const contact = {};
            row.forEach((value, index) => {
                contact[headers[index]] = value;
            });
            return contact;
        });

        const fileName = file.name;
        console.log(contacts, "contacts in xls");
        if (contacts.length <= 100000 && contacts.length > 0) {
            setJsonToServer({ data: contacts, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error(
                "Please select an Excel file with not more than 100,000 records."
            );
        }
    };

    reader.readAsArrayBuffer(file);
    // reader.onload = async (e) => {
    //     const data = new Uint8Array(e.target.result);
    //     const workbook = XLSX.read(data, { type: "array" });
    //     const sheetName = workbook.SheetNames[0];
    //     const sheet = workbook.Sheets[sheetName];
    //     const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    //     const emails = rows
    //     // .filter((emailArray, index) => index !== 0 && emailArray[0] !== undefined) // Skip header row if present
    //     // .map((emailArray) => {
    //     //     return { emailid: emailArray[0] };
    //     // });
    //     const fileName = file.name;
    //     if (emails.length <= 100001) {
    //         setJsonToServer({ emails: emails, fileName: fileName });
    //         setShowAlert(true);
    //     } else {
    //         toast.error(
    //             "Please select a file with not more than 100,000 email addresses"
    //         );
    //     }
    // };
    // reader.readAsArrayBuffer(file);
};

export const handleTXTFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    setFileForClickUp(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split("\n");
        let err = false;

        const headers = lines[0]
            .split(/\s+/) // Split the first line by whitespace
            .map((header) => header.trim()); // Trim each header

        // Process the rest of the lines (skip the first line)
        const contacts = lines
            .slice(1) // Skip the first line (headers)
            .filter((line) => line.trim() !== "") // Remove empty lines
            .map((line) => {
                const values = line.split(/\s+/).map((item) => item.trim()); // Split each line by whitespace
                const contact = {};

                // Map values to headers (keys)
                headers.forEach((header, index) => {
                    contact[header] = values[index] || ""; // Use empty string if value is missing
                });

                return contact;
            });

        if (err) {
            toast.error(
                "Please upload a file with consistent column headers and values."
            );
            return;
        }

        const fileName = file.name;
        if (contacts.length <= 100001) {
            setJsonToServer({ data: contacts, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error(
                "Please select a file with not more than 100,000 email addresses"
            );
        }
    };
    reader.readAsText(file);
};
