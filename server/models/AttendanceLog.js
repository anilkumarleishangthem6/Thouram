const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  action: {
    type: String,
    enum: ['check-in', 'check-out', 'manual-check-in', 'manual-check-out', 'no-show', 'completed'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  method: { type: String, enum: ['qr', 'manual'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  qrTokenId: String,
  verifiedHours: Number,
  dutiesCompleted: [String],
  location: {
    coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] }
  }
}, { timestamps: true });

attendanceLogSchema.index({ event: 1, volunteer: 1 });
attendanceLogSchema.index({ event: 1, action: 1 });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
