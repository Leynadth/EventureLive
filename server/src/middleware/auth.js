const jwt = require('jsonwebtoken');
const User = require('../models/User');


async function authenticateToken(req, res, next) {
  try {
    
    let token = null;
    
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    
    if (!token) {
      token = req.cookies?.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    
    req.user = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}


function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  authorize,
};