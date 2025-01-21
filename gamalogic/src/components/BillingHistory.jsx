import React, { useEffect, useState } from "react";
import axiosInstance from "../axios/axiosInstance";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LoadingBar from "react-top-loading-bar";
import GridLoader from "react-spinners/GridLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
function BillingHistory() {
  const [billingData, setBillingData] = useState([]);
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
  let [invoicesLoad, setInvoicesLoad] = useState(true);
  // let [color, setColor] = useState("#1da6b8");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // setLoading(true);
        // setLoad(30);
        const res = await axiosInstance.get("/listSalesOrders");
        setInvoicesLoad(false);
        console.log(res, "API Response");
        // setLoad(100);
        if (res.data) {
          setBillingData(res.data);
        } else {
          console.warn("No sales orders found in the response");
          setBillingData([]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setBillingData([]);
      }
    };

    fetchInvoices();
  }, []);
  console.log(billingData, "billing dataaaaaaa");
  const handleDownload = async (fileId) => {
    try {
      setLoading(true);
      setLoad(30);
      const response = await axiosInstance.get(`downloadInvoice/${fileId}`);
      const invoiceHTML = response.data.invoiceHTML;
  
      if (!invoiceHTML) {
        throw new Error("Invoice HTML not found");
      }
  
      setLoad(40);
  
      const container = document.createElement("div");
      container.innerHTML = invoiceHTML;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm";
      container.style.minHeight = "297mm";
      document.body.appendChild(container);
  
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
  
      setLoad(70);
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  
      setLoad(100);
      const blob = pdf.output("blob");
      saveAs(blob, `invoice_${fileId}.pdf`);
  
      document.body.removeChild(container);
    } catch (error) {
      console.error("Error while downloading file:", error);
      alert("Failed to download the file. Please try again.");
    }
  };
  

  return (
    <div className="mt-12 font-sans">
      {loading && (
        <LoadingBar
          color="#f74c41"
          progress={load}
          onLoaderFinished={() => {}}
        />
      )}

      {billingData && billingData.length > 0 ? (
        <>
          <h2 className="text-xl font-bold mb-4">Billing History</h2>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full border-collapse text-left rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="px-6 py-2 bg-gray-300 border-b border-gray-200">
                    Date
                  </th>
                  <th className="px-6 py-2 bg-gray-300 border-b border-gray-200">
                    Description
                  </th>
                  <th className="px-6 py-2 bg-gray-300 border-b border-gray-200">
                    Amount
                  </th>
                  <th className="px-6 py-2 bg-gray-300 border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingData.map((entry, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 border-b border-gray-200">
                      {entry.date || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      {entry.items || "No description available"}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      {entry.currency_code == "INR" ? "₹" : "$"}
                      {entry.total || "N/A"}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-center">
                      <button
                        className="cursor-pointer relative group overflow-hidden border-2 px-0 w-28 py-1 border-red-500 text-sm rounded mt-4 md:mt-0"
                        onClick={() => handleDownload(entry.salesorder_id)}
                      >
                        <span className="font-bold text-red-500 text-xs relative z-10 group-hover:text-white duration-500">
                          DOWNLOAD
                        </span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 -translate-x-full group-hover:translate-x-0 h-full"></span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 translate-x-full group-hover:translate-x-0 h-full"></span>
                        <span className="absolute top-0 left-0 w-full bg-red-500 duration-500 delay-300 -translate-y-full group-hover:translate-y-0 h-full"></span>
                        <span className="absolute delay-300 top-0 left-0 w-full bg-red-500 duration-500 translate-y-full group-hover:translate-y-0 h-full"></span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        !invoicesLoad && <p>No billing data available.</p>
      )}
      {invoicesLoad && (
        <div className=" h-96 flex items-center">
          <GridLoader
            color={"#1da6b8"}
            loading={invoicesLoad}
            cssOverride={override}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  );
}

export default BillingHistory;
