import axios from "axios";

async function refreshToken() {
    const Accounts_URL = 'https://accounts.zoho.com';
    const refresh_token = process.env.CAMPAIGNS_REFRESH_TOKEN;
    const client_id = process.env.CAMPAIGNS_CLIENT_ID;
    const client_secret = process.env.CAMPAIGNS_CLIENT_SECRET;
    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);
    formData.append('grant_type', 'refresh_token');
    console.log(formData,'fomrdataaaaa')
    
    try {
        const response = await axios.post(`${Accounts_URL}/oauth/v2/token`, formData);
        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}


async function AddContacts(firstName, lastName, email) {
    try {
        const accessToken = await refreshToken();
        const url = `https://campaigns.zoho.com/api/v1.1/addlistsubscribersinbulk?resfmt=JSON&listkey=${process.env.CAMPAIGNS_LIST_KEY}&emailids=${email}`;
        const headers = {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const response = await axios.post(url, null, { headers });
        // let update=await axios.post(`https://campaigns.zoho.com/api/v1.1/json/listsubscribe?resfmt=JSON&listkey=${process.env.CAMPAIGNS_LIST_KEY}&contactinfo=%7BFirst+Name%3Amac%2CLast+Name%3ALast+Name%2CContact+Email%3Ajai%40zoho.com%7D&source=[sourceName]`)
        try {
            const updateUrl = `https://campaigns.zoho.com/api/v1.1/json/listsubscribe`;
            const updateData = {
                resfmt: 'JSON',
                listkey: process.env.CAMPAIGNS_LIST_KEY,
                contactinfo: JSON.stringify({
                    'First Name': firstName,
                    'Last Name': lastName,
                    'Contact Email': email
                }),
                source: '[sourceName]'
            };
    
            const updateResponse = await axios.post(updateUrl, null, {
                params: updateData,
                headers: headers
            });
            console.log(updateResponse,'update response from zoho campaigns')
        } catch (error) {
            console.log(error)
        }
        return response.data;
    } catch (error) {
        console.error('Error adding contacts:', error.response ? error.response.data : error.message);
        throw error;
    }

}



export default AddContacts;
