// Simple authentication middleware
// In production, you should use JWT tokens properly

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Authorization required.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // For now, we'll just check if token exists
  // In production, verify JWT token here
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization required.'
    });
  }
  
  // Attach token to request for use in controllers
  req.token = token;
  // For now, we'll extract user ID from token if it's in format "userId:actualToken"
  // In production, decode JWT to get user info
  if (token.includes(':')) {
    const [userId] = token.split(':');
    req.userId = userId;
  }
  
  next();
};

// Optional middleware - doesn't require auth but adds user info if available
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.token = token;
    if (token && token.includes(':')) {
      const [userId] = token.split(':');
      req.userId = userId;
    }
  }
  
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth
};

