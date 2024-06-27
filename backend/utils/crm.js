// refreshToken.js

import axios from "axios";

async function refreshToken() {
    const Accounts_URL = 'https://accounts.zoho.com'; 
    const refresh_token = process.env.CRM_REFRESH_TOKEN; 
    const client_id = process.env.CRM_CLIENT_ID; 
    const client_secret = process.env.CRM_CLIENT_SECRET;

    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);
    formData.append('grant_type', 'refresh_token');

    try {
        const response = await axios.post(`${Accounts_URL}/oauth/v2/token`, formData);
        return response.data.access_token; 
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}


async function leadGeneration(firstName,lastName,email){
    let token = await refreshToken()
      const headers = {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      };
      try {
        let postData = {
          "data": [
            {
              "Layout": {
                "id": process.env.CRM_LAYOUT_ID
              },
              "Lead_Owner":process.env.CRM_LEAD_OWNER,
              "Lead_Source":'Sign in',
              "Last_Name": lastName,
              "First_Name": firstName,
              "Email": email,
            },
          ]
        }
        const response = await axios.post('https://www.zohoapis.com/crm/v6/Leads', postData, { headers });
        console.log(response.data)
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
      }
}

export default leadGeneration;
