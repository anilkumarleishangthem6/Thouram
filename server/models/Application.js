const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duty: { type: mongoose.Schema.Types.ObjectId },
  status: {
    type: String,
    enum: ['applied', 'invited', 'confirmed', 'waitlisted', 'declined', 'withdrawn', 'cancelled'],
    default: 'applied',
    index: true
  },
  message: String,
  appliedAt: { type: Date, default: Date.now },
  respondedAt: Date,
  idempotencyKey: { type: String, unique: true, sparse: true },
  matchScore: {
    overall: Number,
    skillFit: Number,
    availability: Number,
    travelDistance: Number,
    experience: Number,
    reliability: Number,
    workQuality: Number
  },
  matchExplanation: String
}, { timestamps: true });

applicationSchema.index({ event: 1, volunteer: 1 }, { unique: true });
applicationSchema.index({ volunteer: 1, status: 1 });
applicationSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
