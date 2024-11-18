let accountDetailsValidation = (req,res,next) => {
    const requiredFields = [
        "title",
        "phone_country_code",
        "phone_number",
        "address_line_1",
        "city",
        "pincode",
        "country",
        "state",
        "firstname",
        "lastname"
    ];

    const validateFields = (data) => {
        const missingFields = requiredFields.filter((field) => !data[field]);
        if (!data.is_company && !data.is_personal) {
            missingFields.push("is_company or is_personal");
        }
        if (data.is_company && !data.company_name) {
            missingFields.push("company_name");
        }
        return missingFields;
    };

    const missingFields = validateFields(req.user[0][0]);
    console.log(missingFields,missingFields.length, 'missing fields')
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Please fill all the required fields to buy credits` });
      }
    
      next();
}
export default accountDetailsValidation