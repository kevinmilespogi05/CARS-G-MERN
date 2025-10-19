const { verifyIdToken, getDb } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await verifyIdToken(token);
    req.user = decodedToken;
    
    // Get user profile from Firestore
    const db = getDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    req.userProfile = userDoc.data();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ error: 'User profile required' });
    }

    const userRole = req.userProfile.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin', 'superAdmin']);
const requirePatrol = requireRole(['patrol', 'admin', 'superAdmin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requirePatrol
};
