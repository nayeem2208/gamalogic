import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { Client as SSHClient } from 'ssh2';
dotenv.config();

// SSH configuration
const sshConfig = {
    host: process.env.SSH_HOST,
    port: 22,
    username: process.env.SSH_USERNAME,
    password: process.env.SSH_PASSWORD
};

// // MySQL server configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 3306,
};



// // Create an SSH tunnel
const connectToMySQL = async () => {
    try {
        const connection = await createSSHTunnel();
        console.log('Connected to MySQL through SSH tunnel');
        return connection;
    } catch (error) {
        console.error('Error connecting to MySQL through SSH tunnel:', error);
        throw error;
    }
};

// // Function to create SSH tunnel
const createSSHTunnel = async () => {
    return new Promise((resolve, reject) => {
        const sshClient = new SSHClient();
        sshClient.on('error', reject);
        sshClient.on('ready', () => {
            sshClient.forwardOut(
                '127.0.0.1',
                3306, // MySQL default port
                dbConfig.host,
                3306, // MySQL default port
                (err, stream) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const updatedDbConfig = {
                        ...dbConfig,
                        stream
                    };

                    const connection = mysql.createConnection(updatedDbConfig);
                    resolve(connection);
                }
            );
        }).connect(sshConfig);
    });
};

export default connectToMySQL;