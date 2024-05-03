// import dbConnection from "../config/RemoteDb.js";
function generateApiKey() {
    const characters =
        'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let apiKey = '';
    for (let i = 0; i < length; i++) {
        apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return apiKey;
}

const isApiKeyUnique = async (apiKey) => {
    try {
        let dbConnection = req.dbConnection;
        const userWithApiKey = await dbConnection.query(`SELECT * FROM registration WHERE api_key='${apiKey}'`);
        return userWithApiKey[0].length === 0;
    } catch (error) {
        console.error("Error in isApiKeyUnique:", error);
        throw error;
    } finally {
        if (req.dbConnection) {
            req.dbConnection.end();
          }
    }
};

const generateUniqueApiKey = async () => {
    let apiKey = generateApiKey();
    while (!(await isApiKeyUnique(apiKey))) {
        apiKey = generateApiKey();
    }
    return apiKey;
};


export default generateUniqueApiKey