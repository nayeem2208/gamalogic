import jwt from 'jsonwebtoken';

function generateConfirmationToken(email) {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
}

export default generateConfirmationToken;
