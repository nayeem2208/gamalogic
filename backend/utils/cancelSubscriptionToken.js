import jwt from 'jsonwebtoken';

function subscriptionCancelConfirmationToken(email) {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
  return token;
}

export default subscriptionCancelConfirmationToken;
