import mySQLconnect from "../config/RemoteDb.js";

const dbMiddleware = async (req, res, next) => {
  let connection;
  try {
    connection = await mySQLconnect();
    req.dbConnection = connection;
    next(); 
  } catch (error) {
    console.error("DB Middleware Error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
};

export default dbMiddleware;

