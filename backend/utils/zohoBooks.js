import axios from "axios";

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
                await updateUserCurrency(accessToken, organizationId, user.id_zoho_books, product.currency);

            } catch (error) {
                if (error.response?.data?.message === 'Contact does not exist.') {
                    console.log('contact has in db but not in books')
                    let contactName = user.username
                    const newContact = await createZohoContact(accessToken, organizationId, { contact_name: contactName, currency_id: product.currency });
                    zohoBookContactId = newContact.contact.contact_id
                    const contactPersonData = {
                        contact_id: newContact.contact.contact_id,
                        first_name: user.firstname || null,
                        last_name: user.lastname || null,
                        email: emailToCheck || null,
                        phone: user.phone_number || null,
                        enable_portal: false,
                    };
                    changeInDb = true
                    contactForSales = await createZohoContactPerson(accessToken, organizationId, contactPersonData);
                }
                else {
                    console.log(error)
                }
            }

        } else {
            console.log(`Email "${emailToCheck}" not found. Creating new contact.`);
            let contactName = user.username
            const newContact = await createZohoContact(accessToken, organizationId, { contact_name: contactName, currency_id: product.currency });
            zohoBookContactId = newContact.contact.contact_id
            const contactPersonData = {
                contact_id: newContact.contact.contact_id,
                first_name: user.firstname || null,
                last_name: user.lastname || null,
                email: emailToCheck || null,
                phone: user.phone_number || null,
                enable_portal: false,
            };
            changeInDb = true
            contactForSales = await createZohoContactPerson(accessToken, organizationId, contactPersonData);
        }
        // console.log(contactForSales, 'contttttttttttttttttttttttttttttttttttttt')
        const customerId = contactForSales.contact_id || contactForSales.contact_person?.contact_id;
        const salesDetails = {
            customer_id: customerId,
            currency_id: product.currency || null,
            contact_persons: [contactForSales.contact_person?.contact_person_id || customerId],
            date: new Date().toISOString().split("T")[0],
            line_items: [
                {
                    rate: product.rate,
                    name: `${product.credits} credits`,
                    quantity: 1,
                    unit: "Nos",
                },
            ],
        };

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
        return response.data;
    } catch (error) {
        console.error("Error Creating Sales Order:", error.response?.data || error.message || error);
        // throw error;
    }
}

// Function to create a new contact in Zoho Books
async function createZohoContact(accessToken, organizationId, contactData) {
    const url = `https://www.zohoapis.in/books/v3/contacts?organization_id=${organizationId}`;

    const headers = {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(url, contactData, { headers });
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
