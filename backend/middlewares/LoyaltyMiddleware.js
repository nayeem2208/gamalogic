const loyalityProgramMiddleware = (req, res, next) => {
    if (req.headers['content-type'] === 'text/html') {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(data); // Parse JSON string if applicable
        } catch (error) {
          req.body = data; // Use raw data if not JSON
        }
        next();
      });
    } else {
      next();
    }
  };
  
  export default loyalityProgramMiddleware;
  