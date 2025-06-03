const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// API key for CountryStateCity API
const API_KEY = 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ==';

// Get all states (public endpoint)
router.get('/states', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.countrystatecity.in/v1/countries/IN/states',
      {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states',
      error: error.response?.data || error.message
    });
  }
});

// Get cities by state (public endpoint)
router.get('/cities/:stateCode', async (req, res) => {
  try {
    const { stateCode } = req.params;
    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
      {
        headers: {
          'X-CSCAPI-KEY': API_KEY
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.response?.data || error.message
    });
  }
});

// Get property locations (stations)
router.get('/stations', protect, async (req, res) => {
  try {
    const stations = await Property.distinct('station');
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations',
      error: error.message
    });
  }
});

// Get sub-locations by station
router.get('/sub-locations/:station', protect, async (req, res) => {
  try {
    const { station } = req.params;
    const subLocations = await Property.distinct('subLocation', { station });
    res.json({
      success: true,
      data: subLocations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sub-locations',
      error: error.message
    });
  }
});

// Get banner images based on location (public endpoint)
router.get('/banners', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    const response = await axios.get(
      `https://asia-south1-starzapp.cloudfunctions.net/EstatexD4P/banners`,
      {
        params: {
          location
        }
      }
    );

    // If the API call is successful but some images are inaccessible,
    // provide fallback images from Pexels
    const fallbackImages = [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'
    ];

    const banners = response.data.success ? response.data.data : fallbackImages;

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    // If the banner API fails, return fallback images
    res.json({
      success: true,
      data: [
        'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
        'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'
      ]
    });
  }
});

// Get nearby properties
router.get('/nearby', protect, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'approved'
    }).populate('owner', 'fullName phone email');

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby properties',
      error: error.message
    });
  }
});

// Search locations
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in stations and sub-locations
    const stations = await Property.distinct('station', {
      station: { $regex: query, $options: 'i' }
    });

    const subLocations = await Property.distinct('subLocation', {
      subLocation: { $regex: query, $options: 'i' }
    });

    res.json({
      success: true,
      data: {
        stations,
        subLocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching locations',
      error: error.message
    });
  }
});

module.exports = router;
