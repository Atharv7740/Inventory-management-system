const jwt = require('jsonwebtoken');

// Standard JWT verification middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (userId, email) to the request
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

// Middleware to allow **only admin** (hardcoded email match)
function adminOnly(req, res, next) {
  if (req.user?.email !== 'admin@ims.com') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminOnly
};
