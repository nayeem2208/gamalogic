import React, { useEffect, useState } from "react";
import { getCountries, getCountry, getStates } from "country-state-picker";
import countryCodes from "country-codes-list";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";

function MoreDetails() {
  const [accountType, setAccountType] = useState("Company");
  const [countryid, setCountryid] = useState("");
  const [stateid, setStateid] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [phoneCode, setPhoneCode] = useState("");
  const [edit, setEdit] = useState(false);
  const [editWait, setEditWait] = useState(false);
  let [loading, setLoading] = useState(false);
  let [load, setLoad] = useState(30);
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
  useEffect(() => {
    const fetchMoreDetails = async () => {
      try {
        setLoading(true);
        setLoad(30);
        let res = await axiosInstance.get("/getMoreDetails");
        setLoad(100);
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
        setAccountType(fetchedData.is_personal == 1 ? "Personal" : "Company")
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
  }, [userDetails]);

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

  const validateFields = () => {
    const trimmedfirstname = moreDetails.firstname.trim();
    const trimmedlastname = moreDetails.lastname.trim();
    const trimmdcompanyName = moreDetails.company_name.trim();
    const trimmedAddress = moreDetails.address_line_1.trim();

    if (!moreDetails.title) {
      toast.error("Please select a title.");
      return false;
    }
    if (!moreDetails.firstname || !trimmedfirstname) {
      toast.error("First name is required.");
      return false;
    }
    if (!moreDetails.lastname || !trimmedlastname) {
      toast.error("Last name is required.");
      return false;
    }
    if (!moreDetails.phone_country_code||moreDetails.phone_country_code=='Select' ) {
      toast.error("Please add the details");
      return false;
    }
    if (!/^\d{6,}$/.test(moreDetails.phone_number)) {
      toast.error("Please add the details");
      return false;
    }
    if (
      (accountType === "Company" && !moreDetails.company_name) ||
      (accountType === "Company" && !trimmdcompanyName)
    ) {
      toast.error("Company name is required for Company account type.");
      return false;
    }
    if (!moreDetails.address_line_1 || !trimmedAddress) {
      toast.error("Address line 1 is required.");
      return false;
    }
    if (!moreDetails.city) {
      toast.error("City is required.");
      return false;
    }
    if (!moreDetails.pincode) {
      toast.error(
        countryid === "in" ? "Pincode is required." : "Zip Code is required."
      );
      return false;
    }
    if (!countryid) {
      toast.error("Country is required.");
      return false;
    }
    if (stateList.length > 0 && !stateid) {
      toast.error("State is required.");
      return false;
    }

    return true;
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
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
      setLoading(true);
      setLoad(30);
      setEditWait(true);
      let res = await axiosInstance.post("/updateMoreDetails", dataToSend);
      toast.success("Profile Data updated");
      setEdit(false);
      setLoad(100);
      setEditWait(false);
      const storedToken = localStorage.getItem("Gamalogic_token");
      if (storedToken) {
        let token;
        try {
          token = JSON.parse(storedToken);
        } catch (error) {
          token = storedToken;
        }
        token.name = dataToSend.firstname +" "+ dataToSend.lastname;
        localStorage.setItem("Gamalogic_token", JSON.stringify(token));
        setUserDetails(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mb-24 md:mb-20 ">
      <div
        className=" text-xs sm:text-sm text-bgblue subHeading"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {loading && (
          <LoadingBar
            color="#f74c41"
            progress={load}
            onLoaderFinished={() => {}}
          />
        )}
        {/* <h3 className="text-lg">More Details</h3> */}
        <div className=" mt-8  mb-4 rounded-md  w-full md:w-3/6 ">
          <div className="md:flex w-full md:w-full ">
            {/* <MdModeEdit  className="w-6 h-6 text-end"/> */}
            <div>
              <p className="mt-6 mb-1 text-sm">Title</p>
              <select
                className={`border   h-9 border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
                name="title"
                value={moreDetails.title}
                onChange={handleInputChange}
                disabled={!edit}
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
                readOnly={!edit}
                placeholder="First Name"
                // className="w-full border border-gray-300 rounded py-2 px-4 mr-3"
                className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
              />
            </div>
            <div className="md:w-2/4">
              <p className="mt-6 mb-1 text-sm">Last Name</p>
              <input
                type="text"
                name="lastname"
                value={moreDetails.lastname}
                onChange={handleInputChange}
                readOnly={!edit}
                placeholder="Last Name"
                className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
              />
            </div>
          </div>
          <div className="md:flex w-full  justify-center md:justify-normal md:w-full">
            <div className="md:mr-3 w-full md:w-3/5">
              <p className="mt-6 mb-1 text-sm">Code</p>
              <select
                name="phone_country_code"
                className={`border w-full   h-9 border-gray-300   rounded py-2 px-4 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
                value={phoneCode}
                onChange={handleCodeChange}
                disabled={!edit}
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
                readOnly={!edit}
                placeholder="Phone"
                className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
              />
            </div>
          </div>
          {/* <p className="mt-6 mb-1 text-sm">Phone</p>
          <input
            type="text"
            placeholder="Phone"
            className="w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
          /> */}
          <div className="w-full sm:w-4/6 md:w-full mt-6 py-4 mr-3">
            <p className="text-sm mb-2">Select Account Type</p>
            <div className="flex mt-6 justify-center md:justify-normal">
              <div className="w-2/5 xl:w-1/5 mr-3">
                <label className="flex items-center mb-2">
                  {/* <input
                    type="radio"
                    name="accountType"
                    value="Company"
                    className={`form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out ${
                      edit ? "input-box" : "input-box-readonly"
                    }`}
                    checked={accountType === "Company"}
                    onChange={hanleAccountType}
                    disabled={!edit}
                  /> */}

                  <input
                    type="radio"
                    name="accountType"
                    value="Company"
                    className={`form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out ${
                      edit ? "input-box" : "input-box-readonly"
                    }`}
                    checked={accountType === "Company"}
                    onChange={hanleAccountType}
                    disabled={!edit}
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
                    disabled={!edit}
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
                readOnly={!edit}
                placeholder="Company Name"
                className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
              />
            </>
          )}
          <p className="mt-6 mb-1 text-sm">Address Line 1</p>
          <input
            type="text"
            name="address_line_1"
            value={moreDetails.address_line_1}
            onChange={handleInputChange}
            readOnly={!edit}
            placeholder="Address line 1"
            className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
              edit ? "input-box" : "input-box-readonly"
            }`}
          />
          <p className="mt-6 mb-1 text-sm">Address Line 2</p>
          <input
            type="text"
            name="address_line_2"
            value={moreDetails.address_line_2}
            onChange={handleInputChange}
            readOnly={!edit}
            placeholder="Address line 2"
            className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
              edit ? "input-box" : "input-box-readonly"
            }`}
          />
          <div className="flex flex-wrap w-full sm:w-4/6 md:w-full mt-6">
            <div className="flex w-full">
              <div className="w-2/4 mr-3">
                <p className="mb-1 text-sm">City</p>
                <input
                  type="text"
                  name="city"
                  value={moreDetails.city}
                  onChange={handleInputChange}
                  readOnly={!edit}
                  placeholder="City"
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                    edit ? "input-box" : "input-box-readonly"
                  }`}
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
                  readOnly={!edit}
                  placeholder={countryid == "in" ? "Pincode" : "Zip Code"}
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 ${
                    edit ? "input-box" : "input-box-readonly"
                  }`}
                />
              </div>
            </div>
            <div className="flex w-full mt-6">
              <div className="w-2/4 mr-3 mb-4">
                <p className="text-sm mb-1">Country</p>
                <select
                  onChange={handleCountryChange}
                  disabled={!edit}
                  className={`w-full border  border-gray-300  h-9 rounded py-2 px-4 ${
                    edit ? "input-box" : "input-box-readonly"
                  }`}
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
                  disabled={!edit}
                  onChange={handleStateChange}
                  className={`w-full border  border-gray-300  h-9 rounded py-2 px-4 ${
                    edit ? "input-box" : "input-box-readonly"
                  }`}
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
            <div className="w-full sm:w-4/6 md:w-full">
              <p className="mt-4 mb-1 text-sm">
                {countryid == "in" ? "GSTIN" : "TAX ID"}
              </p>
              <input
                readOnly={!edit}
                type="text"
                name="tax_id"
                value={moreDetails.tax_id}
                onChange={handleInputChange}
                placeholder={countryid == "in" ? "GSTIN" : "TAX ID"}
                className={`w-full md:w-full  border border-gray-300 rounded py-2 px-4 mr-3 ${
                  edit ? "input-box" : "input-box-readonly"
                }`}
              />
            </div>
          </div>
          <br />
          {userDetails.isTeamMember != 1 &&
            (edit ? (
              <button
                className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium"
                type="submit"
                onClick={handleUpdateData}
                disabled={editWait}
              >
                SAVE
              </button>
            ) : (
              <button
                className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium"
                type="submit"
                onClick={() => setEdit(true)}
              >
                EDIT
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default MoreDetails;
