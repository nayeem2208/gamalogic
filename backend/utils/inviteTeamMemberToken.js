import jwt from 'jsonwebtoken';

function inviteTeamMemberToken(userEmail, teamIds) {
  const token = jwt.sign(
    { userEmail, teamIds }, 
    process.env.JWT_SECRET, 
    { expiresIn: '4d' }
  );
  return token;
}

export default inviteTeamMemberToken;
