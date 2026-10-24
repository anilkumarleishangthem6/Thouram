const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  bio: { type: String, maxlength: 500 },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  languages: [{ type: String, trim: true }],
  availability: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: true },
    mornings: { type: Boolean, default: true },
    afternoons: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false },
    notes: String
  },
  location: {
    city: String,
    area: String,
    coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
    travelRadiusKm: { type: Number, default: 15 }
  },
  accessibilityPreferences: {
    wheelchairAccessRequired: { type: Boolean, default: false },
    hearingAccommodation: { type: Boolean, default: false },
    visualAccommodation: { type: Boolean, default: false },
    notes: String
  },
  profileCompletionPercent: { type: Number, default: 0 },
  totalVerifiedHours: { type: Number, default: 0 },
  completedEventsCount: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 100, min: 0, max: 100 },
  workQualityScore: { type: Number, default: 0, min: 0, max: 5 },
  workQualityCount: { type: Number, default: 0 },
  onboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

volunteerProfileSchema.index({ 'location.coordinates': '2dsphere' });
volunteerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
