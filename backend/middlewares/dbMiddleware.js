import mySqlPool from "../config/DB.js";
import ErrorHandler from "../utils/errorHandler.js";

const dbMiddleware = async (req, res, next) => {
  let connection;
  try {
    connection = await mySqlPool.getConnection();
    req.dbConnection = connection;
    next(); 
  } catch (error) {
    console.error("DB Middleware Error:", error);
    ErrorHandler("DbMiddeware Error", error, req);
    res.status(500).json({ error: "Database connection failed" });
  }
};

export default dbMiddleware;


