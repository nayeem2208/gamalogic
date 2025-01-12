import axios from "axios";
import getStateCodeByName from "./stateCodes.js";

// Client credentials
const clientid = process.env.BOOKS_CLIENT_ID;
const secret = process.env.BOOKS_CLIENT_SECRET;
const refresh_token = process.env.BOOKS_REFRESH_TOKEN;
const organization_id = process.env.BOOKS_ORG_ID
// Validate environment variables
if (!clientid || !secret || !refresh_token) {
    throw new Error("Environment variables are missing for Zoho API credentials.");
}

// Function to refresh the access token
async function refreshToken() {
    const Accounts_URL = "https://accounts.zoho.in";
    const formData = new URLSearchParams();
    formData.append("refresh_token", refresh_token);
    formData.append("client_id", clientid);
    formData.append("client_secret", secret);
    formData.append("grant_type", "refresh_token");

    try {
        const response = await axios.post(`${Accounts_URL}/oauth/v2/token`, formData);
        return response.data.access_token;
    } catch (error) {
        console.error("Error refreshing access token:", error.response?.data || error.message || error);
        // throw error;
    }
}

// Function to fetch contacts and check if an email exists
async function ZohoBooks(user, product) {
    try {
        let emailToCheck = user.emailid
        const accessToken = await refreshToken();
        const organizationId = organization_id;
        let zohoBookContactId = null

        // const taxes = await axios.get(
        //     `https://www.zohoapis.in/books/v3/settings/taxes?`,
        //     {
        //         headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        //         params: { organization_id: organizationId },
        //     }
        // );
        // console.log(taxes.data.taxes, 'taxessssssssssssss')
        // console.log(sampleError)
        let contactForSales;
        let changeInDb = false
        if (user.id_zoho_books) {
            try {
                const contactResponse = await axios.get(
                    `https://www.zohoapis.in/books/v3/contacts/${user.id_zoho_books}`,
                    {
                        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                        params: { organization_id: organizationId },
                    }
                );
                contactForSales = contactResponse.data.contact
                const primaryContactId = contactResponse.data?.contact?.primary_contact_id;
                if (primaryContactId) {
                    contactForSales.contact_person = { contact_person_id: primaryContactId };
                } else {
                    console.log("Primary contact ID not found in the response.");
                }

            } catch (error) {
                if (error.response?.data?.message === 'Contact does not exist.') {
                    console.log('contact has in db but not in books')
                    let contactName = user.username
                    const newContact = await createZohoContact(accessToken, organizationId, { contact_name: contactName, currency_id: product.currency }, user);
                    zohoBookContactId = newContact.contact.contact_id
                    const contactPersonData = {
                        contact_id: newContact.contact.contact_id,
                        salutation: user.title || null,
                        first_name: user.firstname || null,
                        last_name: user.lastname || null,
                        email: emailToCheck || null,
                        phone: user.phone_number || null,
                        enable_portal: false,
                    };
                    changeInDb = true
                    await updateUserCurrency(accessToken, organizationId, newContact.contact.contact_id, product.currency);
                    contactForSales = await createZohoContactPerson(accessToken, organizationId, contactPersonData);
                }
                else {
                    console.log(error)
                }
            }

        } else {
            console.log(`Email "${emailToCheck}" not found. Creating new contact.`);
            let contactName = user.username
            const newContact = await createZohoContact(accessToken, organizationId, { contact_name: contactName, currency_id: product.currency }, user);
            zohoBookContactId = newContact.contact.contact_id
            const contactPersonData = {
                contact_id: newContact.contact.contact_id,
                salutation: user.title || null,
                first_name: user.firstname || null,
                last_name: user.lastname || null,
                email: emailToCheck || null,
                phone: user.phone_number || null,
                enable_portal: false,
            };
            changeInDb = true
            await updateUserCurrency(accessToken, organizationId, newContact.contact.contact_id, product.currency);
            contactForSales = await createZohoContactPerson(accessToken, organizationId, contactPersonData);
        }
        // console.log(contactForSales, 'contttttttttttttttttttttttttttttttttttttt')
        const customerId = contactForSales.contact_id || contactForSales.contact_person?.contact_id;
        const placeOfSupply = getStateCodeByName(user.state)
        const salesDetails = {
            customer_id: customerId,
            currency_id: product.currency || null,
            contact_persons: [contactForSales.contact_person?.contact_person_id || customerId],
            date: new Date().toISOString().split("T")[0],
            ...(user.country == 'India' && !user.tax_id && user.state != 'Kerala' && { place_of_supply: placeOfSupply }),
            gst_treatment: user.country == 'India'
                ? (user.tax_id ? "business_gst" : "business_none")
                : "overseas",
            ...(user.country == 'India' && user.tax_id && { gst_no: user.tax_id }),
            // gst_treatment:'overseas',
            // is_inclusive_tax: true,
            line_items: [
                {
                    rate: user.country === 'India' ? parseFloat((product.rate / 1.18).toFixed(2)) : product.rate,
                    name: `${product.credits} credits ${product.methord}`,
                    product_type: 'service',
                    tax_id: (() => {
                        if (user.country == 'India') {
                            if (user.state == 'Kerala') {
                                return "2234640000000179212";
                            } else {
                                return "2234640000000179110";
                            }
                        }
                        else {
                            return '2234640000000179104';
                        }
                    })(),
                    hsn_or_sac:'998313'
                },
            ],
            taxes: [
                {
                    tax_id: (() => {
                        if (user.country === 'India') {
                            console.log(user.state, user.state == 'kerala', 'state of user')
                            if (user.state == 'Kerala') {
                                return "2234640000000179212";
                            } else {
                                return "2234640000000179110";
                            }
                        } else {
                            return '2234640000000179104';
                        }
                    })(),
                    // tax_name: "GST",
                }
            ],
            // adjustment:product.rate * (1 - 0.18)- ,
            // adjustment_description: "Adjustment",
        };
        console.log(salesDetails, 'sales Detailssssssssssssss')
        await createSalesOrder(accessToken, organizationId, salesDetails);
        return { zohoBookContactId, changeInDb }
    } catch (error) {
        if (error.response?.data?.message == 'Contact does not exist.') {

        }
        console.error("Error in ZohoBooks function:", error.response?.data || error.message || error);
        // throw error;
    }
}

// Function to create a sales order in Zoho Books
async function createSalesOrder(accessToken, organizationId, salesOrderData) {
    const url = `https://www.zohoapis.in/books/v3/salesorders?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(url, salesOrderData, { headers });
        await ApproveSalesOrder(accessToken, organizationId, response.data)
        return response.data;
    } catch (error) {
        console.error("Error Creating Sales Order:", error.response?.data || error.message || error);
        // throw error;
    }
}

async function ApproveSalesOrder(accessToken, organizationId, salesOrderData) {
    // console.log(salesOrderData,'check chek chekkkkk',salesOrderData.salesorder.salesorder_id,'sales order data for approving')
    const url = `https://www.zohoapis.in/books/v3/salesorders/${salesOrderData.salesorder.salesorder_id}/status/open?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(url, salesOrderData, { headers });
        console.log(response.data, 'response on approving sales data');
    } catch (error) {
        console.error("Error Approving Sales Order:", error.response?.data || error.message || error);
        // throw error;
    }
}

// Function to create a new contact in Zoho Books
async function createZohoContact(accessToken, organizationId, contactData, user) {
    let input = user.phone_country_code || "";
    let phCode = input.split(' ').pop();
    let gstTreatment;
    if (user.country === 'India') {
        gstTreatment = user.tax_id ? "business_gst" : "business_none";
    } else {
        gstTreatment = "overseas";
    }
    const placeOfSupply = getStateCodeByName(user.state)

    let requestBody = {
        ...contactData,
        ...(user.is_company == 1 && { company_name: user.company_name, }),
        gst_treatment: gstTreatment,
        ...(user.country == 'India' && user.tax_id && { gst_no: user.tax_id || null }),
        ...(user.country == 'India' && !user.tax_id && user.state != 'Kerala' && { place_of_contact: placeOfSupply }),
        customer_sub_type: user.is_company == 1 ? "business" : 'individual',
        billing_address: {
            attention: `${user.title}.${user.username}`,
            address: user.address_line_1,
            street2: user.address_line_2 || null,
            city: user.city || null,
            state: user.state || null,
            zip: user.pincode,
            country: user.country,
            phone: `${phCode} ${user.phone_number}`,
        },
        // shipping_address: {
        //     attention: `${user.title}.${user.username}`,
        //     address: user.address_line_1,
        //     street2: user.address_line_2 || null,
        //     city: user.city || null,
        //     state: user.state || null,
        //     zip: user.pincode,
        //     country: user.country,
        //     phone: `${phCode} ${user.phone_number}`,
        // },

    }

    console.log(requestBody, 'request body to create contact ')
    const url = `https://www.zohoapis.in/books/v3/contacts?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(url, requestBody, { headers });
        // console.log("Contact Created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Creating Contact:", error.response?.data || error.message || error);
        // throw error;
    }
}

// Function to create a contact person for an existing contact in Zoho Books
async function createZohoContactPerson(accessToken, organizationId, contactPersonData) {
    const url = `https://www.zohoapis.in/books/v3/contacts/contactpersons?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(url, contactPersonData, { headers });
        // console.log("Contact Person Created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Creating Contact Person:", error.response?.data || error.message || error);
        // throw error;
    }
}

async function updateUserCurrency(accessToken, organizationId, contactId, currencyId) {
    const url = `https://www.zohoapis.in/books/v3/contacts/${contactId}?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    const data = {
        currency_id: currencyId,
    };

    try {
        const response = await axios.put(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error("Error updating user currency:", error.response?.data || error.message || error);
        // throw error;
    }
}

export default ZohoBooks;
