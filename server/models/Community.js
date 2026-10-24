const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, maxlength: 2000 },
  mission: String,
  logoUrl: String,
  coverImage: String,
  causes: [{ type: String, trim: true }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] }
  },
  contactEmail: { type: String, trim: true },
  contactPhone: String,
  website: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'approved'],
    default: 'verified'
  },
  verificationDetails: {
    verifiedAt: Date,
    badgeType: String,
    notes: String
  },
  verifiedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  memberCount: { type: Number, default: 1 },
  stats: {
    totalEventsHosted: { type: Number, default: 0 },
    totalVolunteersMobilized: { type: Number, default: 0 },
    totalHoursLogged: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

communitySchema.virtual('isVerified').get(function() {
  return this.verificationStatus === 'verified' || this.verificationStatus === 'approved';
});

communitySchema.virtual('status').get(function() {
  return this.verificationStatus;
}).set(function(s) {
  this.verificationStatus = s;
});

communitySchema.virtual('logo').get(function() {
  return this.logoUrl;
}).set(function(l) {
  this.logoUrl = l;
});

communitySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Community', communitySchema);
