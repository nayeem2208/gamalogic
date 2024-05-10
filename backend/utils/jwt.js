import jwt from 'jsonwebtoken';

const generateToken = (res, userId,api_key) => {
  const token = jwt.sign({ userId,api_key }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  return token
};

export default generateToken;