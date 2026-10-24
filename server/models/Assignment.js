const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duty: { type: mongoose.Schema.Types.ObjectId },
  dutyTitle: String,
  team: String,
  status: {
    type: String,
    enum: ['assigned', 'confirmed', 'waitlisted', 'checked-in', 'checked-out', 'no-show', 'completed', 'cancelled'],
    default: 'assigned',
    index: true
  },
  isBackup: { type: Boolean, default: false },
  waitlistPosition: { type: Number },
  promotedAt: Date,
  promotionDeadline: Date,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overrideReason: String,
  subManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subManagerScope: { type: String, enum: ['event', 'team', 'duty'] },
  checkInAt: Date,
  checkOutAt: Date,
  checkInMethod: { type: String, enum: ['qr', 'manual'] },
  checkInActor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkInReason: String,
  verifiedHours: { type: Number, default: 0 },
  idempotencyKey: { type: String, unique: true, sparse: true },
  cancellationReason: String,
  cancelledAt: Date
}, { timestamps: true });

assignmentSchema.index({ event: 1, volunteer: 1 }, { unique: true });
assignmentSchema.index({ event: 1, status: 1 });
assignmentSchema.index({ volunteer: 1, status: 1 });
assignmentSchema.index({ event: 1, isBackup: 1, waitlistPosition: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
