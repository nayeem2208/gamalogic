import jwt from "jsonwebtoken";
import db from "../config/DB.js";

const authcheck =  async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const tokenWithoutBearer = token.replace("Bearer ", "");
      let parsedTokenWithoutBearer=JSON.parse(tokenWithoutBearer)
      const decoded = jwt.verify(parsedTokenWithoutBearer.token, process.env.JWT_SECRET);
      req.user = await db.query(`SELECT emailid FROM registration WHERE rowid='${decoded.userId}'`);
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Unauthorized" }); 
    }
  } else {
    res.status(401).json({ error: "Unauthorized" }); 
  }
};

export default authcheck;