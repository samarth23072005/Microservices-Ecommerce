
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn }
  );
};

module.exports = generateToken;