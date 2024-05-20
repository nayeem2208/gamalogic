import jwt from 'jsonwebtoken';

function generateConfirmationToken(email) {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return token;
}

export default generateConfirmationToken;
