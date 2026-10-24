const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  requiredSkills: [{ type: String, trim: true }],
  volunteersRequired: { type: Number, required: true, min: 1 },
  volunteersConfirmed: { type: Number, default: 0 },
  physicalIntensity: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' }
});

const eventSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 5000 },
  cause: { type: String, trim: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'paused', 'cancelled', 'closed', 'completed'],
    default: 'draft',
    index: true
  },
  location: {
    venue: String,
    address: String,
    city: String,
    area: String,
    coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
    meetingPoint: String,
    isVirtual: { type: Boolean, default: false },
    virtualLink: String
  },
  dateTime: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    timeZone: { type: String, default: 'Asia/Kolkata' },
    checkInOpensMinutesBefore: { type: Number, default: 30 },
    checkInClosesMinutesAfter: { type: Number, default: 60 }
  },
  duties: [dutySchema],
  capacity: {
    totalRequired: { type: Number, required: true, min: 1 },
    confirmed: { type: Number, default: 0 },
    waitlisted: { type: Number, default: 0 },
    backupCount: { type: Number, default: 0 } // Calculated: ceil(totalRequired * 0.10)
  },
  volunteerInstructions: String,
  whatToBring: [String],
  providedOnSite: [String],
  safety: {
    firstAidAvailable: { type: Boolean, default: false },
    emergencyContact: String,
    physicalRequirements: String,
    accessibilityNotes: String
  },
  tags: [{ type: String, trim: true }],
  imageUrl: String,
  impactSummary: String,
  publishedAt: Date,
  closedAt: Date
}, { timestamps: true });

eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ 'dateTime.start': 1, status: 1 });
eventSchema.index({ community: 1, status: 1 });

// Calculate backup count before save
eventSchema.pre('save', function() {
  if (this.isModified('capacity.totalRequired') && this.capacity?.totalRequired) {
    this.capacity.backupCount = Math.ceil(this.capacity.totalRequired * 0.10);
  }
});

module.exports = mongoose.model('Event', eventSchema);
