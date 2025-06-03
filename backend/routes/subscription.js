const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { protect, admin } = require('../middleware/authMiddleware');

// Base price per location (in INR)
const BASE_PRICE_PER_LOCATION = 999;

// Calculate subscription price based on locations
const calculatePrice = (locations) => {
  return locations.length * BASE_PRICE_PER_LOCATION;
};

// Get broker's subscription
router.get('/my-subscription', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ broker: req.user._id });

    res.json({
      success: true,
      data: subscription || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new subscription
router.post('/', protect, async (req, res) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one location'
      });
    }

    // Calculate total price
    const totalPrice = calculatePrice(locations);

    // Set subscription period (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Format locations with price per location
    const formattedLocations = locations.map(location => ({
      name: location.name,
      coordinates: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      radius: location.radius || 5000, // Default 5km radius
      price: BASE_PRICE_PER_LOCATION
    }));

    // Check if broker already has a subscription
    let subscription = await Subscription.findOne({ broker: req.user._id });

    if (subscription) {
      // Update existing subscription
      subscription.locations = formattedLocations;
      subscription.totalPrice = totalPrice;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.status = 'pending';
      subscription.paymentStatus = 'pending';
      
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        broker: req.user._id,
        locations: formattedLocations,
        totalPrice,
        startDate,
        endDate,
        status: 'pending',
        paymentStatus: 'pending'
      });
    }

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update subscription payment status (simulate payment completion)
router.post('/complete-payment', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ broker: req.user._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update payment status and add to payment history
    subscription.paymentStatus = 'completed';
    subscription.status = 'active';
    subscription.paymentHistory.push({
      amount: subscription.totalPrice,
      date: new Date(),
      status: 'completed',
      transactionId: 'TRANS_' + Date.now() // In real implementation, this would come from payment gateway
    });

    await subscription.save();

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin routes

// Get all subscriptions (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('broker', 'fullName email phone');

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update subscription status (admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get subscription pricing info
router.get('/pricing', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        basePrice: BASE_PRICE_PER_LOCATION,
        description: 'Price per location for 30 days subscription'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
