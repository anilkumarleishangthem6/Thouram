const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'role_change',
      'event_create',
      'event_update',
      'event_status_change',
      'assignment_create',
      'assignment_override',
      'cancellation',
      'backup_promotion',
      'attendance_checkin',
      'attendance_checkout',
      'attendance_correction',
      'rating_submitted',
      'community_updated'
    ],
    index: true
  },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: { type: String, required: true, enum: ['User', 'Community', 'Event', 'Assignment', 'AttendanceLog', 'Rating', 'CommunityMembership'] },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
  details: { type: mongoose.Schema.Types.Mixed },
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed },
  reason: String,
  ipAddress: String,
  correlationId: String
}, { timestamps: true });

auditLogSchema.index({ event: 1, createdAt: -1 });
auditLogSchema.index({ community: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
