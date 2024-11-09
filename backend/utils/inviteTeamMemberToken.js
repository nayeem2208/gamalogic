import jwt from 'jsonwebtoken';

function inviteTeamMemberToken(userEmail, teamEmail) {
  const token = jwt.sign(
    { userEmail, teamEmail }, 
    process.env.JWT_SECRET, 
    { expiresIn: '4d' }
  );
  return token;
}

export default inviteTeamMemberToken;
