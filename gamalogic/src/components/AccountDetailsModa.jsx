import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { getCountries, getCountry, getStates } from "country-state-picker";
import countryCodes from "country-codes-list";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-toastify";
import { useUserState } from "../context/userContext";
import LoadingBar from "react-top-loading-bar";
import { FaStarOfLife } from "react-icons/fa";

function AccountDetailsModal({ isOpen }) {
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
  const [modalIsOpen, setModalIsOpen] = useState(isOpen);

  useEffect(() => {
    setModalIsOpen(isOpen);
  }, [isOpen]);

  let { setUserDetails, userDetails, setAccountDetailsModal } = useUserState();

  const countryCodesObject = countryCodes.customList(
    "countryCode",
    "{countryNameEn} +{countryCallingCode}"
  );
  useEffect(() => {
    const fetchMoreDetails = async () => {
      try {
        let res = await axiosInstance.get("/getMoreDetails");
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
  }, []);

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
    setStateid(""); 
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
      toast.error("Please add the details");
      return false;
    }
    if (!moreDetails.firstname || !trimmedfirstname) {
      toast.error("Please add the details");

      return false;
    }
    if (!moreDetails.lastname || !trimmedlastname) {
      toast.error("Please add the details");
      return false;
    }
    if (!moreDetails.phone_country_code||moreDetails.phone_country_code=='Select' ) {
      toast.error("Please add the details");
      return false;
    }
    if (!/^\d{6,}$/.test(moreDetails.phone_number)) {
      if (!moreDetails.phone_number) {
        toast.error("Phone number is required.");
      } else if (!/^\d+$/.test(moreDetails.phone_number)) {
        toast.error("Phone number should contain only numbers, no special characters or spaces.");
      } else {
        toast.error("Phone number should have at least 6 digits.");
      }
      return false;
    }
    if (
      (accountType === "Company" && !moreDetails.company_name) ||
      (accountType === "Company" && !trimmdcompanyName)
    ) {
      toast.error("Please add the details");
      return false;
    }
    if (!moreDetails.address_line_1 || !trimmedAddress) {
      toast.error("Please add the details");
      return false;
    }
    if (!moreDetails.city) {
      toast.error("Please add the details");
      return false;
    }
    if (!moreDetails.pincode) {
      toast.error("Please add the details");
      return false;
    }
    if (!countryid) {
      toast.error("Please add the details");
      return false;
    }
    if (stateList.length > 0 && !stateid) {
      toast.error("Please add the details");
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
      let res = await axiosInstance.post("/updateMoreDetails", dataToSend);
      setAccountDetailsModal(false);
      toast.success("Profile Data updated");
      const storedToken = localStorage.getItem("Gamalogic_token");
      if (storedToken) {
        let token;
        try {
          token = JSON.parse(storedToken);
        } catch (error) {
          token = storedToken;
        }
        token.name = dataToSend.firstname +' '+ dataToSend.lastname;
        token.accountDetailsModal = false;
        token.accountDetailsModalInBuyCredits=false
        localStorage.setItem("Gamalogic_token", JSON.stringify(token));
        setUserDetails(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      border: "none",
      borderRadius: 15,
      padding: 6,
      //   width: "60%",
      height: "70%",
      width: "90%", // Set a base width for responsiveness
      maxWidth: "900px",
      maxHeight: "calc(150vh - 100px)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  };
  return (
    <ReactModal
      isOpen={modalIsOpen}
      style={customStyles}
      appElement={document.getElementById("root")}
    >
      <div className="mb-24 md:mb-20 px-6">
        <div
          className=" text-xs sm:text-sm text-bgblue subHeading"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          <div className=" mt-8  mb-4 rounded-md  w-full md:w-full ">
            <h3 className="text-center md:text-left">Complete Your Profile</h3>
            <p className="text-xs my-3 text-center md:text-left">
              Please fill in your account details to ensure a smooth experience.
              This information will help us personalize your account and comply
              with relevant regulations. Fields marked with an asterisk (
              <FaStarOfLife className="text-red-500 inline w-[6px] h-[6px] mb-1"/>) are mandatory.
            </p>
            <div className="flex flex-wrap justify-center md:flex md:flex-nowrap  w-full md:w-full ">
              <div>
                <p className="mt-6 mb-1 text-sm flex">
                  Title<span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <select
                  className={`border   h-9 border-gray-300 bg-white rounded py-2 px-4 mr-3 `}
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
              <div className="w-full md:w-2/4 md:mr-3">
                <p className="mt-6 mb-1 text-sm flex">
                  First Name{" "}
                  <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <input
                  type="text"
                  name="firstname"
                  value={moreDetails.firstname}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  // className="w-10/12 md:w-full border border-gray-300 rounded py-2 px-4 mr-3"
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                />
              </div>
              <div className="w-full md:w-2/4 ">
                <p className="mt-6 mb-1 text-sm flex">
                  Last Name{" "}
                  <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <input
                  type="text"
                  name="lastname"
                  value={moreDetails.lastname}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                />
              </div>
            </div>
            <div className="md:flex w-full  justify-center md:justify-normal md:w-full">
              <div className="md:mr-3 w-full md:w-3/5">
                <p className="mt-6 mb-1 text-sm flex">
                  Code<span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <select
                  name="phone_country_code"
                  className={`border w-full   h-9 border-gray-300 bg-white  rounded py-2 px-4 `}
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
                <p className="mt-6 mb-1 text-sm flex">
                  Phone<span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <input
                  type="text"
                  name="phone_number"
                  value={moreDetails.phone_number}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                />
              </div>
            </div>
            {/* <p className="mt-6 mb-1 text-sm">Phone</p>
          <input
            type="text"
            placeholder="Phone"
            className="w-5/6 sm:w-4/6 md:w-3/6 border border-gray-300 rounded py-2 px-4 mr-3"
          /> */}
            <div className="w-full sm:w-4/6 md:w-full mt-6 py-4 mr-3 ">
              <p className="text-sm mb-2">Select Account Type</p>
              <div className="flex mt-6 ">
                <div className="w-2/5 xl:w-1/5 mr-3">
                  <label className="flex items-center mb-2">
                    {/* <input
                    type="radio"
                    name="accountType"
                    value="Company"
                    className={`form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out `}
                    checked={accountType === "Company"}
                    onChange={hanleAccountType}
                  /> */}

                    <input
                      type="radio"
                      name="accountType"
                      value="Company"
                      className={`form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out `}
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
                <p className="mt-6 mb-1 text-sm flex">
                  Company Name
                  <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                </p>
                <input
                  type="text"
                  name="company_name"
                  value={moreDetails.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                />
              </>
            )}
            <p className="mt-6 mb-1 text-sm flex">
              Address Line 1{" "}
              <span className="text-red-500 text-3xl ml-1 h-2">*</span>
            </p>
            <input
              type="text"
              name="address_line_1"
              value={moreDetails.address_line_1}
              onChange={handleInputChange}
              placeholder="Address line 1"
              className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
            />
            <p className="mt-6 mb-1 text-sm">Address Line 2</p>
            <input
              type="text"
              name="address_line_2"
              value={moreDetails.address_line_2}
              onChange={handleInputChange}
              placeholder="Address line 2"
              className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
            />
            <div className="flex flex-wrap w-full sm:w-4/6 md:w-full mt-6">
              <div className="flex w-full">
                <div className="w-2/4 mr-3">
                  <p className="mb-1 text-sm flex">
                    City{" "}
                    <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                  </p>
                  <input
                    type="text"
                    name="city"
                    value={moreDetails.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                  />
                </div>
                <div className="w-2/4">
                  <p className="mb-1 text-sm flex">
                    {countryid == "in" ? "Pincode" : "Zip Code"}
                    <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                  </p>

                  <input
                    type="text"
                    name="pincode"
                    value={moreDetails.pincode}
                    onChange={handleInputChange}
                    placeholder={countryid == "in" ? "Pincode" : "Zip Code"}
                    className={`w-full border border-gray-300 rounded py-2 px-4 mr-3 `}
                  />
                </div>
              </div>
              <div className="flex w-full mt-6">
                <div className="w-2/4 mr-3 mb-4">
                  <p className="text-sm mb-1 flex">
                    Country{" "}
                    <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                  </p>
                  <select
                    onChange={handleCountryChange}
                    className={`w-full border  border-gray-300 bg-white  h-9 rounded py-2 px-4 `}
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
                  <p className="text-sm mb-1 flex">
                    State{" "}
                    <span className="text-red-500 text-3xl ml-1 h-2">*</span>
                  </p>
                  <select
                    onChange={handleStateChange}
                    className={`w-full border  border-gray-300 bg-white  h-9 rounded py-2 px-4 `}
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
                  type="text"
                  name="tax_id"
                  value={moreDetails.tax_id}
                  onChange={handleInputChange}
                  placeholder={countryid == "in" ? "GSTIN" : "TAX ID"}
                  className={`w-full md:w-full  border border-gray-300 rounded py-2 px-4 mr-3 `}
                />
              </div>
            </div>
            <br />
            <button
              className="bg-bgblue text-white py-2  px-4 rounded-md mt-6 text-sm font-medium"
              type="submit"
              onClick={handleUpdateData}
            >
               SAVE BILLING INFORMATION
            </button>
          </div>
        </div>
      </div>
    </ReactModal>
  );
}

export default AccountDetailsModal;
