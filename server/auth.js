const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Support both single role (legacy) and multiple roles
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Flatten roles array in case it's passed as [['role1', 'role2']]
    const requiredRoles = roles.flat();
    
    // Check if user has at least one of the required roles
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
