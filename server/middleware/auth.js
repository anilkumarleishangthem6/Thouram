const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-thouram-2025';

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Or check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing. Please log in.',
        correlationId: req.correlationId
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: 'The user belonging to this token no longer exists.',
        correlationId: req.correlationId
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired authentication token.',
      correlationId: req.correlationId
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Ignore invalid token in optionalAuth
  }
  next();
};

module.exports = { authenticate, optionalAuth, JWT_SECRET };
