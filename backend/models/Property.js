const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['residential', 'commercial', 'shops', 'bungalow', 'rawHouse', 'villa', 'pentHouse', 'plot'],
    required: true
  },
  type: {
    type: String,
    enum: ['new', 'resale', 'rental'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Common fields for all types
  buildingOrSociety: {
    type: String,
    required: true
  },
  roadOrLocation: {
    type: String,
    required: true
  },
  station: {
    type: String,
    required: true
  },
  subLocation: String,
  propertyType: {
    type: String,
    required: true
  }, // e.g., "1 BHK", "2.5 BHK"
  isCosmo: {
    type: Boolean,
    default: false
  },
  // Fields specific to type: 'new'
  possessionDate: Date,
  totalPackage: Number,
  brochureUrl: String,
  images: [String],
  videoUrl: String,
  // Fields specific to type: 'resale'
  expectedPrice: Number,
  floorNo: String,
  flatNo: String,
  contactName: String,
  contactNumber: String,
  isDirect: Boolean,
  // Fields specific to type: 'rental'
  rent: Number,
  deposit: Number,
  furnishing: {
    type: String,
    enum: ['unfurnished', 'semifurnished', 'furnished']
  },
  buildingNo: String,
  totalFloors: Number,
  wing: String,
  propertyAge: Number,
  amenities: [String],
  parking: {
    type: String,
    enum: ['none', 'open', 'covered']
  },
  availableFrom: Date,
  ownership: String,
  masterBedrooms: Number,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes
propertySchema.index({ location: '2dsphere' });
propertySchema.index({ category: 1, type: 1, status: 1 });
propertySchema.index({ station: 1, subLocation: 1 });

// Middleware to handle type-specific validation
propertySchema.pre('save', function(next) {
  if (this.type === 'new') {
    if (!this.possessionDate || !this.totalPackage) {
      return next(new Error('Possession date and total package are required for new properties'));
    }
  } else if (this.type === 'resale') {
    if (!this.expectedPrice || !this.floorNo || !this.flatNo) {
      return next(new Error('Expected price, floor number, and flat number are required for resale properties'));
    }
  } else if (this.type === 'rental') {
    if (!this.rent || !this.deposit || !this.furnishing) {
      return next(new Error('Rent, deposit, and furnishing details are required for rental properties'));
    }
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);
