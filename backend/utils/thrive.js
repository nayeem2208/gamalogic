import axios from "axios";
import crypto from 'crypto'

// Client credentials
let clientid = process.env.THRIVE_CLIENT_ID;
let secret = process.env.THRIVE_CLIENT_SECRET;
let refresh_token = process.env.THRIVE_REFRESH_TOKEN;
let brand_code=process.env.THRIVE_BRAND_CODE

// Function to refresh access token
async function refreshToken() {
    const Accounts_URL = 'https://accounts.zoho.com';
    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', clientid);
    formData.append('client_secret', secret);
    formData.append('grant_type', 'refresh_token');

    try {
        const response = await axios.post(`${Accounts_URL}/oauth/v2/token`, formData);
        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to make the purchase API call
async function PurchaseApi(email, amount, orderId) {
    try {
        // Get the access token by refreshing it
        const accessToken = await refreshToken();

        // API URL for the purchase
        const apiUrl = `https://thrive.zoho.com/thrive-publicapi/v1/${brand_code}/purchase`;

        let email_id = email
        let algorithm = "sha256"

        const requestBody = {
            email: email,
            amount: amount,
            order_id: orderId,
        };

        // Send the POST request
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Purchase response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error making purchase API call:', error, 'error in thrive setting up');
        // throw error;
    }
}

// Example usage:x

export default PurchaseApi;
