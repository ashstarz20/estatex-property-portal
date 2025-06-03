const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  locations: [{
    name: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    radius: {
      type: Number,
      default: 5000 // Default radius in meters (5km)
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    status: String,
    transactionId: String
  }]
}, {
  timestamps: true
});

// Index for geospatial queries on locations
subscriptionSchema.index({ 'locations.coordinates': '2dsphere' });

// Method to calculate total price based on selected locations
subscriptionSchema.methods.calculateTotalPrice = function() {
  return this.locations.reduce((total, location) => total + location.price, 0);
};

// Pre-save middleware to update total price
subscriptionSchema.pre('save', function(next) {
  this.totalPrice = this.calculateTotalPrice();
  next();
});

// Static method to check if a broker has access to a location
subscriptionSchema.statics.hasLocationAccess = async function(brokerId, coordinates) {
  const subscription = await this.findOne({
    broker: brokerId,
    status: 'active',
    endDate: { $gt: new Date() }
  });

  if (!subscription) return false;

  // Check if any subscribed location covers these coordinates
  return subscription.locations.some(location => {
    // Calculate distance between points using MongoDB's $geoNear (implementation needed)
    // For now, return true if subscription exists
    return true;
  });
};

// Virtual for subscription status
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && 
         this.endDate > new Date() && 
         this.paymentStatus === 'completed';
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
