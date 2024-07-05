import * as XLSX from "xlsx";
import Papa from "papaparse";

export const handleCSVFile = async (file, setFileForClickUp, setJsonToServer, setShowAlert, toast) => {
    try {
        setFileForClickUp(file);
        Papa.parse(file, {
            complete: async function (results) {
                const emails = results.data
                    .filter((emailArray) => emailArray[0] !== "emailid") 
                    .map((emailArray) => {
                        return { emailid: emailArray[0] };
                    });
                const fileName = file.name;
                if (emails.length <= 100001) {
                    setJsonToServer({ emails: emails, fileName: fileName });
                    setShowAlert(true);
                } else {
                    toast.error(
                        "Please select a file with not more than 100,000 email addresses"
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

        const emails = rows
            .filter((emailArray, index) => index !== 0 && emailArray[0] !== undefined) // Skip header row if present
            .map((emailArray) => {
                return { emailid: emailArray[0] };
            });
        const fileName = file.name;
        if (emails.length <= 100001) {
            setJsonToServer({ emails: emails, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error(
                "Please select a file with not more than 100,000 email addresses"
            );
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

        const emails = lines
            .filter((line) => line.trim() !== "")
            .map((line) => {
                return { emailid: line.trim() };
            });
        const fileName = file.name;
        if (emails.length <= 100001) {
            setJsonToServer({ emails: emails, fileName: fileName });
            setShowAlert(true);
        } else {
            toast.error(
                "Please select a file with not more than 100,000 email addresses"
            );
        }
    };
    reader.readAsText(file);
};
