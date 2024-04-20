import { useState } from "react";
import SubHeader from "../components/SubHeader";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";

function EmailFinder() {
  let [data, setData] = useState({ fullname: "", domain: "" });
  let [result, setResult] = useState("");
  let [loading,setLoading]=useState(false)

  function onInputChange(event, inputType) {
    const value = event.target.value;
    setData((prevData) => ({
      ...prevData,
      [inputType]: value,
    }));
  }

  const HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      setResult('')
      let domain = data.domain.trim();
      let fullname = data.fullname.trim();
      if (domain && fullname) {
        let fullnameArray = fullname.split(" ");
        console.log(fullnameArray, fullnameArray.length, "fullnamearray");
        if (fullnameArray.length >= 2) {
          setLoading(true)
          let res = await axiosInstance.post("/singleEmailFinder", data);
          setLoading(false)
          setResult(res.data);
          setData({ fullname: "", domain: "" });
        } else {
          toast.error("Please provide a fullname");
        }
      } else {
        toast.error("Please provide valid fullname and domain");
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(result, "result");
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Email Finder"} />
      <div className="mt-14 subHeading">
        <h3>Find The Email Address</h3>
        <p className="my-7 w-4/5 description">
          Enter a full name and the domain name of the email address below to
          find the email address of any professional with our email finding
          tool.
        </p>
        <div className="flex w-4/5 justify-between">
          <form className="flex flex-col w-5/12 " onSubmit={HandleSubmit}>
            <p>Full Name</p>
            <input
              type="text"
              placeholder="Elon Musk"
              className=" border border-gray-400 rounded-md py-2 px-4 mr-3"
              value={data.fullname}
              onChange={(e) => onInputChange(e, "fullname")}
            />
            <p className="mt-4">Domain Name</p>
            <input
              type="text"
              placeholder="tesla.com"
              className=" border border-gray-400 rounded-md py-2 px-4 mr-3"
              value={data.domain}
              onChange={(e) => onInputChange(e, "domain")}
            />
            <button
              className="bg-bgblue text-white py-1 px-4 rounded-md  w-32 h-9 mt-8"
              type="submit"
            >
              FIND EMAIL
            </button>
          </form>
          <div className=" flex justify-end w-3/6 ">
            <p className="bg-gray-100 rounded h-2/5 p-2 mt-6 font-semibold">
              Note:
              <br />
              <span className="font-light">
                {" "}
                Each check will cost you 10 credits!
              </span>
            </p>
          </div>
        </div>
        {loading&&<p className="my-4">Loading...</p>}
        {result && (
          <div>
            <p className="font-medium text-lg mt-8 mb-4">Result</p>
            {result.email ? (
              <div>
                <p className="description text-base">
                  We found 1 email addresses.
                </p>
                <table className="description QucikValidationtable my-4  w-2/6">
                  <tr>
                    <td className="mr-5 py-2">{result.email}</td>
                    <td className="mr-5 py-2 flex justify-center items-center">
                      <button
                        className="bg-bgblue text-white p-1 rounded-md   text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(result.email);
                        }}
                      >
                        COPY
                      </button>
                    </td>
                  </tr>
                </table>
              </div>
            ):<p>Oops! Sorry, we couldn't help you.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailFinder;
