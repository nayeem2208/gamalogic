import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const password=process.env.SQLPASSWORD

const mySqlPool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:password,
    database:"user"
})

// const mySqlPool=mysql.createPool({
//     host:"localhost",
//     user:"dbbetauser",
//     password:password,
//     database:"DB_GAMALOGIC"
// })

export default mySqlPool


