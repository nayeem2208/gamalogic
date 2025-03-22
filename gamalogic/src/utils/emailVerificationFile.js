import * as XLSX from "xlsx";
import Papa from "papaparse";


export const handleCSVFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    try {
        setFileForClickUp(file);
        Papa.parse(file, {
            header: false, // Parse without headers initially
            skipEmptyLines: false,
            complete: async function (results) {
                const filteredData = results.data.filter((row) => {
                    // Check if any cell in the row has a non-empty value
                    return row.some((cell) => cell && cell.trim() !== "");
                });

                results.data = filteredData;
                results.fileName = file.name;
                if (results.data.length <= 100000) {
                    setJsonToServer(results);
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

        if (rows.length > 0) {
            rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
        }
        const contacts = rows

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
        const lines = text.split("\n");
        let err = false;
        const contacts = lines
            .filter((line) => line.trim() !== "") // Remove empty lines
            .map((line) => {
                return line.split(",").map((item) => item.trim()); // Split each line by commas and trim
            });

        if (err) {
            toast.error(
                "Please upload a file with consistent column headers and values."
            );
            return;
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
