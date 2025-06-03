const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const { protect, admin } = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ isAdmin: false }), // Total brokers
      Property.countDocuments(), // Total properties
      Property.countDocuments({ status: 'pending' }), // Pending properties
      Subscription.countDocuments({ status: 'active' }), // Active subscriptions
    ]);

    res.json({
      success: true,
      data: {
        totalBrokers: stats[0],
        totalProperties: stats[1],
        pendingProperties: stats[2],
        activeSubscriptions: stats[3]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all brokers
router.get('/brokers', protect, admin, async (req, res) => {
  try {
    const brokers = await User.find({ isAdmin: false })
      .select('-password')
      .populate('subscription');

    res.json({
      success: true,
      count: brokers.length,
      data: brokers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get broker details with their properties and subscription
router.get('/brokers/:id', protect, admin, async (req, res) => {
  try {
    const broker = await User.findById(req.params.id)
      .select('-password')
      .populate('subscription');

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    const properties = await Property.find({ owner: broker._id });

    res.json({
      success: true,
      data: {
        broker,
        properties
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update broker status (activate/deactivate)
router.patch('/brokers/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const broker = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
      ).select('-password');

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    res.json({
      success: true,
      data: broker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all pending properties
router.get('/pending-properties', protect, admin, async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'fullName email phone');

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve/reject property
router.patch('/properties/:id/review', protect, admin, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminRemarks: remarks,
        reviewedAt: new Date(),
        reviewedBy: req.user._id
      },
      { new: true }
    ).populate('owner', 'fullName email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get subscription analytics
router.get('/subscription-analytics', protect, admin, async (req, res) => {
  try {
    const analytics = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get property analytics
router.get('/property-analytics', protect, admin, async (req, res) => {
  try {
    const analytics = await Property.aggregate([
      {
        $group: {
          _id: {
            category: '$category',
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
