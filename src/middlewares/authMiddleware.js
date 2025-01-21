const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Authorization middleware for admins
const authorizeAdmin = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Access Denied. Admins only.' });
  }
  next();
};


module.exports = { authenticate, authorize, authorizeAdmin };
