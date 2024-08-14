import jwt from "jsonwebtoken";

const APIDecode =  async (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const tokenWithoutBearer = token.replace("Bearer ", "");
      let parsedTokenWithoutBearer=JSON.parse(tokenWithoutBearer)
      const decoded = jwt.verify(parsedTokenWithoutBearer.token, process.env.JWT_SECRET);
      req.user = decoded
      if(!req.user.api_key){
        res.status(401).json({ error: "Unauthorized" });
      }
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: "TokenExpired", message: "Your session has expired. Please log in again." });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    }

  } else {
    res.status(401).json({ error: "Unauthorized" }); 
  }
};

export default APIDecode;