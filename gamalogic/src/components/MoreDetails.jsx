import React, { useEffect, useState } from "react";
import { getCountries, getCountry, getStates } from "country-state-picker";
import countryCodes from "country-codes-list";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";

function MoreDetails({ ChangeUserName }) {
  const [accountType, setAccountType] = useState("Company");
  const [countryid, setCountryid] = useState("");
  const [stateid, setStateid] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [phoneCode, setPhoneCode] = useState("");
  const [moreDetails, setMoreDetails] = useState({
    title: "",
    firstname: "",
    lastname: "",
    phone_country_code: "",
    phone_number: "",
    accountType: "Company",
    company_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    pincode: "",
    tax_id: "",
  });

  let { setUserDetails, userDetails } = useUserState();


  const countryCodesObject = countryCodes.customList(
    "countryCode",
    "{countryNameEn} +{countryCallingCode}"
  );
  console.log(moreDetails,'moreDetails')
  useEffect(() => {
    const fetchMoreDetails = async () => {
      try {
        let res = await axiosInstance.get("/getMoreDetails");
        console.log(res, "ressooo");
        const fetchedData = res.data;

        // Map fetched data to form initial values
        setMoreDetails({
          title: fetchedData.title || "",
          firstname: fetchedData.firstname || "",
          lastname: fetchedData.lastname || "",
          phone_country_code: fetchedData.phone_country_code || "",
          phone_number: fetchedData.phone_number || "",
          accountType: fetchedData.is_personal == 1 ? "Personal" : "Company",
          company_name: fetchedData.company_name || "",
          address_line_1: fetchedData.address_line_1 || "",
          address_line_2: fetchedData.address_line_2 || "",
          city: fetchedData.city || "",
          pincode: fetchedData.pincode || "",
          tax_id: fetchedData.tax_id || "",
        });
        setPhoneCode(fetchedData.phone_country_code);
        let country = getCountry(fetchedData.country || "");
        setCountryid(country.code || "");
        const states = getStates(country.code || "");
        setStateList(states || null);
        setStateid(fetchedData.state || "");
      } catch (error) {
        console.error("Error fetching details", error);
      }
    };
    fetchMoreDetails();
  },[]);

  useEffect(() => {
    let countries = getCountries();
    setCountriesList(countries);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMoreDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const selectedCountryCode = e.target.value;
    let country = getCountry(selectedCountryCode);
    setCountryid(selectedCountryCode);
    const states = getStates(selectedCountryCode);
    setStateList(states);
    setStateid(""); // Reset state selection when country changes
  };

  const handleStateChange = (e) => {
    const selectedStateCode = e.target.value;
    console.log(selectedStateCode, "state codeeeeeeeeeeeeeeeey");
    setStateid(selectedStateCode);
  };

  const handleCodeChange = (e) => {
    setPhoneCode(e.target.value);
    handleInputChange(e);
  };

  const hanleAccountType = (e) => {
    setAccountType(e.target.value);
    handleInputChange(e);
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = Object.fromEntries(
        Object.entries(moreDetails).filter(([_, value]) => value !== "")
      );
      if (dataToSend.accountType == "Personal" && dataToSend.company_name) {
        delete dataToSend.company_name;
      }
      if (countryid) {
        const country = getCountry(countryid);
        dataToSend.country = country.name;

        if (stateid) {
          dataToSend.state = stateid;
        }
      }

      let res = await axiosInstance.post("/updateMoreDetails", dataToSend);
      toast.success("Profile Data updated");
        if (dataToSend.firstname||dataToSend.lastname) {
          ChangeUserName(dataToSend.firstname||null,dataToSend.lastname||null)
        } 
      console.log(res, "res");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mb-24 md:mb-20">
      <div
        className="mt-6 sm:mt-10 text-xs sm:text-sm text-bgblue subHeading"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <h3 className="text-lg">More Details</h3>
        <div>
          <div className="md:flex w-full md:w-3/6">
            <div>
              <p className="mt-6 mb-1 text-sm">Title</p>
              <select
                className="border bg-white  h-9 border-gray-300 rounded py-2 px-4 mr-3"
                name="title"
                value={moreDetails.title}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Miss">Miss</option>
              </select>
            </div>
            <div className="md:w-2/4 md:mr-3">
              <p className="mt-6 mb-1 text-sm">First Name</p>
              <input
                type="text"
                name="firstname"
                value={moreDetails.firstname}
                onChange={handleInputChange}
                placeholder="First Name"
                className="w-10/12 md:w-full border border-gray-300 rounded py-2 px-4 mr-3"
              />
            </div>
            <div className="md:w-2/4">
              <p className="mt-6 mb-1 text-sm">Last Name</p>
              <input
                type="text"
                name="lastname"
                value={moreDetails.lastname}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="w-10/12 md:w-full border border-gray-300 rounded py-2 px-4 mr-3"
              />
            </div>
          </div>
          <div className="flex w-full  justify-center md:justify-normal md:w-3/6">
            <div className="md:mr-3 w-3/5">
              <p className="mt-6 mb-1 text-sm">Code</p>
              <select
                name="phone_country_code"
                className="border w-full   h-9 border-gray-300 bg-white  rounded py-2 px-4"
                value={phoneCode}
                onChange={handleCodeChange}
              >
                <option>Select</option>
                {Object.entries(countryCodesObject).map(
                  ([code, displayText]) => (
                    <option key={code} value={displayText.split(": +")[1]}>
                      {displayText}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="md:w-full ">
              <p className="mt-6 mb-1 text-sm">Phone</p>
              <input
                type="text"
                name="phone_number"
                value={moreDetails.phone_number}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-10/12 md:w-full border border-gray-300 rounded py-2 px-4 mr-3"
              />
            </div>
          </div>
          {/* <p className="mt-6 mb-1 text-sm">Phone</p>
          <input
            type="text"
            placeholder="Phone"
            className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
          /> */}
          <div className="w-full sm:w-4/6 md:w-3/6 mt-6 py-4 mr-3">
            <p className="text-sm mb-2">Select Account Type</p>
            <div className="flex mt-6 justify-center md:justify-normal">
              <div className="w-2/5 xl:w-1/5 mr-3">
                <label className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="accountType"
                    value="Company"
                    className="form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out"
                    checked={accountType === "Company"}
                    onChange={hanleAccountType}
                  />
                  <span className="ml-3 text-gray-700">Company</span>
                </label>
              </div>
              <div className="w-1/5">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="Personal"
                    className="form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out"
                    checked={accountType === "Personal"}
                    onChange={hanleAccountType}
                  />
                  <span className="ml-3 text-gray-700">Personal</span>
                </label>
              </div>
            </div>
          </div>
          {accountType === "Company" && (
            <>
              <p className="mt-6 mb-1 text-sm">Company Name</p>
              <input
                type="text"
                name="company_name"
                value={moreDetails.company_name}
                onChange={handleInputChange}
                placeholder="Company Name"
                className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
              />
            </>
          )}
          <p className="mt-6 mb-1 text-sm">Address Line 1</p>
          <input
            type="text"
            name="address_line_1"
            value={moreDetails.address_line_1}
            onChange={handleInputChange}
            placeholder="Address line 1"
            className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
          />
          <p className="mt-6 mb-1 text-sm">Address Line 2</p>
          <input
            type="text"
            name="address_line_2"
            value={moreDetails.address_line_2}
            onChange={handleInputChange}
            placeholder="Address line 2"
            className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
          />
          <div className="flex flex-wrap w-full sm:w-4/6 md:w-3/6 mt-6">
            <div className="flex w-full">
              <div className="w-2/4 mr-3">
                <p className="mb-1 text-sm">City</p>
                <input
                  type="text"
                  name="city"
                  value={moreDetails.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full border border-gray-300 rounded py-2 px-4 mr-3"
                />
              </div>
              <div className="w-2/4">
                <p className="mb-1 text-sm">
                  {countryid == "in" ? "Pincode" : "Zip Code"}
                </p>
                <input
                  type="text"
                  name="pincode"
                  value={moreDetails.pincode}
                  onChange={handleInputChange}
                  placeholder={countryid == "in" ? "Pincode" : "Zip Code"}
                  className="w-full border border-gray-300 rounded py-2 px-4 mr-3"
                />
              </div>
            </div>
            <div className="flex w-full mt-6">
              <div className="w-2/4 mr-3 mb-4">
                <p className="text-sm mb-1">Country</p>
                <select
                  onChange={handleCountryChange}
                  className="w-full border bg-white border-gray-300  h-9 rounded py-2 px-4"
                  value={countryid}
                >
                  <option value="">Select Country</option>
                  {countriesList.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-2/4 mb-4">
                <p className="text-sm mb-1">State</p>
                <select
                  onChange={handleStateChange}
                  className="w-full border bg-white border-gray-300  h-9 rounded py-2 px-4"
                  value={stateid}
                >
                  <option value="">Select State</option>
                  {stateList.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="">
            <div className="w-full sm:w-4/6 md:w-3/6">
              <p className="mt-4 mb-1 text-sm">
                {countryid == "in" ? "GSTIN" : "TAX ID"}
              </p>
              <input
                type="text"
                name="tax_id"
                value={moreDetails.tax_id}
                onChange={handleInputChange}
                placeholder={countryid == "in" ? "GSTIN" : "TAX ID"}
                className="w-full md:w-full  border border-gray-300 rounded py-2 px-4 mr-3"
              />
            </div>
          </div>
          <br />
          <button
            className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium"
            type="submit"
            onClick={handleUpdateData}
          >
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoreDetails;
