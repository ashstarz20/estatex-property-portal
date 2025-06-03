const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, admin, checkSubscription, checkLocationAccess } = require('../middleware/authMiddleware');

// Get properties with filters
router.get('/', protect, checkSubscription, async (req, res) => {
  try {
    const {
      category = 'residential',
      type,
      propertyType,
      station,
      minBudget,
      maxBudget,
      subLocation,
      isCosmo
    } = req.query;

    // Build filter object
    const filter = { category };
    if (type) filter.type = type;
    if (propertyType) filter.propertyType = propertyType;
    if (station) filter.station = station;
    if (subLocation) filter.subLocation = subLocation;
    if (isCosmo !== undefined) filter.isCosmo = isCosmo === 'true';

    // Add budget filter based on type
    if (minBudget || maxBudget) {
      const budgetField = type === 'rental' ? 'rent' : type === 'resale' ? 'expectedPrice' : 'totalPackage';
      filter[budgetField] = {};
      if (minBudget) filter[budgetField].$gte = parseInt(minBudget);
      if (maxBudget) filter[budgetField].$lte = parseInt(maxBudget);
    }

    // Add status filter for approved properties only
    filter.status = 'approved';

    const properties = await Property.find(filter)
      .populate('owner', 'fullName phone email')
      .sort({ createdAt: -1 });

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

// Add new property (broker only)
router.post('/', protect, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id,
      status: 'pending' // All new properties start as pending
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
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

// Get broker's inventory
router.get('/my-inventory', protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

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

// Update property (owner or admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or admin status
    if (property.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // If broker is updating, maintain pending status
    if (!req.user.isAdmin) {
      req.body.status = 'pending';
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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

// Delete property (owner or admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or admin status
    if (property.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.remove();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin routes

// Get pending properties (admin only)
router.get('/pending', protect, admin, async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'fullName phone email')
      .sort({ createdAt: -1 });

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

// Approve/reject property (admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

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

module.exports = router;
