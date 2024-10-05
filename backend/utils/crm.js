// refreshToken.js

import axios from "axios";
import ErrorHandler from "./errorHandler.js";

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
async function JessicaRefreshToken() {
  const Accounts_URL = 'https://accounts.zoho.com';
  const refresh_token = process.env.JESSICA_CRM_REFRESH_TOKEN;
  const client_id = process.env.JESSICA_CRM_CLIENT_ID;
  const client_secret = process.env.JESSICA_CRM_CLIENT_SECRET;

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



async function leadGeneration(firstName, lastName, email,source,req) {
  let beninToken = await refreshToken()
  const beninHeaders = {
    'Authorization': `Zoho-oauthtoken ${beninToken}`,
    'Content-Type': 'application/json'  
  };

  let jessicaToken = await JessicaRefreshToken()
  const jessicaHeaders = {
    'Authorization': `Zoho-oauthtoken ${jessicaToken}`,
    'Content-Type': 'application/json'
  };

  try {
    const beninResponse = await axios.get('https://www.zohoapis.com/crm/v6/Leads?fields=Last_Name,Email', { headers: beninHeaders })
    const jessicaResponse = await axios.get('https://www.zohoapis.com/crm/v6/Leads?fields=Last_Name,Email', { headers: jessicaHeaders })

    const beninExistingLead = beninResponse.data.data.find((lead) => lead.Email === email);
    const jessicaExistingLead = jessicaResponse.data.data.find((lead) => lead.Email === email);
    if (!beninExistingLead && !jessicaExistingLead) {
      let postData = {
        "data": [
          {
            "Layout": {
              "id": process.env.CRM_LAYOUT_ID
            },
            "Lead_Owner": process.env.CRM_LEAD_OWNER,
            "Lead_Source": source,
            "Last_Name": lastName,
            "First_Name": firstName,
            "Email": email,
          },
        ]
      }
      let res=await axios.post('https://www.zohoapis.com/crm/v6/Leads', postData, { headers: beninHeaders });
      console.log(res.data,'response from crm lead generation')
    }
    else if (beninExistingLead) {
      const existingLeadId = beninExistingLead.id;
      let postData = {
        "data": [
          {
            "id": existingLeadId,
            "Lead_Status": "Sign in after CRM Marketing",
          }
        ]
      }
      await axios.put('https://www.zohoapis.com/crm/v6/Leads', postData, { headers: beninHeaders });
    }
    else if (jessicaExistingLead) {
      const existingLeadId = jessicaExistingLead.id;
      let postData = {
        "data": [
          {
            "id": existingLeadId,
            "Owner": process.env.CRM_LEAD_OWNER_ID,
            "Lead_Status": "Sign in after CRM Marketing",
          }
        ]
      }
      await axios.put('https://www.zohoapis.com/crm/v6/Leads', postData, { headers: jessicaHeaders });
    }

  } catch (error) {
    console.error('Error in leadGeneration:', error);
    ErrorHandler("registerUser Controller CRM lead Generation ", error, req);
    throw new Error(`Lead generation failed for ${email}. Error: ${error.message}`);
  }
}

export const updateLeadStatus = async (email) => {
  try {
    let beninToken = await refreshToken()
    const beninHeaders = {
      'Authorization': `Zoho-oauthtoken ${beninToken}`,
      'Content-Type': 'application/json'
    };
    try {
      const beninResponse = await axios.get('https://www.zohoapis.com/crm/v6/Leads?fields=Last_Name,Email,Lead_Status', { headers: beninHeaders })
      const beninExistingLead = beninResponse.data.data.find((lead) => lead.Email === email);
      if (beninExistingLead && beninExistingLead.Lead_Status != 'Paid User') {
        const existingLeadId = beninExistingLead.id;
        let postData = {
          "data": [
            {
              "id": existingLeadId,
              "Lead_Status": "Paid User",
            }
          ]
        }
        await axios.put('https://www.zohoapis.com/crm/v6/Leads', postData, { headers: beninHeaders });
      }
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
}

export default leadGeneration;
