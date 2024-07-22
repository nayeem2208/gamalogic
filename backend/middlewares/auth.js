import jwt from "jsonwebtoken";
// import dbConnection from "../config/RemoteDb.js";

const authcheck =  async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const dbConnection = req.dbConnection;
      const tokenWithoutBearer = token.replace("Bearer ", "");
      let parsedTokenWithoutBearer=JSON.parse(tokenWithoutBearer)
      const decoded = jwt.verify(parsedTokenWithoutBearer.token, process.env.JWT_SECRET);
      req.user = await dbConnection.query(`SELECT * FROM registration WHERE rowid='${decoded.userId}'`);
      if (req.user.length === 0||req.user[0].length==0) {
        throw new Error('User not found');
      }
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: "TokenExpired", message: "Your session has expired. Please log in again." });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    }
    //finally {  
    //   if (req.dbConnection) {
    //     req.dbConnection.end();
    //   }
    // }

  } else {
    res.status(401).json({ error: "Unauthorized" }); 
  }
};

export default authcheck;