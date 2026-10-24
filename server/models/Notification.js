const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['event_invitation', 'application_status', 'backup_promotion', 'event_update', 'reminder', 'system'],
    default: 'system',
    index: true
  },
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  relatedAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  read: { type: Boolean, default: false, index: true },
  readAt: Date,
  emailSent: { type: Boolean, default: false },
  sentAt: Date,
  actionUrl: String,
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
