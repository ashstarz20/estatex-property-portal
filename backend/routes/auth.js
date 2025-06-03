const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const axios = require('axios');

// Helper function to validate coordinates
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      reraNumber,
      state,
      city,
      password,
      confirmPassword,
      latitude,
      longitude
    } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate coordinates
    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      phone,
      reraNumber,
      state,
      city,
      password,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get states route
router.get('/states', async (req, res) => {
  try {
    const response = await axios.get('https://api.countrystatecity.in/v1/countries/IN/states', {
      headers: {
        'X-CSCAPI-KEY': 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ=='
      }
    });

    res.json({
      success: true,
      states: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states'
    });
  }
});

// Get cities route
router.get('/cities/:stateCode', async (req, res) => {
  try {
    const { stateCode } = req.params;
    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
      {
        headers: {
          'X-CSCAPI-KEY': 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ=='
        }
      }
    );

    res.json({
      success: true,
      cities: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities'
    });
  }
});

module.exports = router;
