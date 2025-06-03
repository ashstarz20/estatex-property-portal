const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = 'estateX-secret-key-2024';

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is admin
exports.admin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin rights required'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has active subscription
exports.checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscription');

    if (!user.subscription || !user.subscription.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Active subscription required'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to generate JWT token
exports.generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

// Helper function to verify location access
exports.checkLocationAccess = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates required'
      });
    }

    const hasAccess = await req.user.subscription.hasLocationAccess(
      req.user.id,
      [parseFloat(longitude), parseFloat(latitude)]
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Location not in subscription'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
