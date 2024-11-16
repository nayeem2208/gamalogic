import jwt from 'jsonwebtoken';

const generateToken = (res, userId,api_key,team_id) => {
  const token = jwt.sign({ userId,api_key,team_id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return token
};

export default generateToken;