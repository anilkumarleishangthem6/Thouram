const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raterRole: { type: String, enum: ['organizer', 'sub-manager'], default: 'organizer' },
  reliabilityScore: { type: Number, required: true, min: 1, max: 5 },
  workQualityScore: { type: Number, required: true, min: 1, max: 5 },
  feedbackComments: String,
  dutyTitle: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ratingSchema.virtual('feedbackNotes')
  .get(function() { return this.feedbackComments; })
  .set(function(v) { this.feedbackComments = v; });

ratingSchema.index({ event: 1, volunteer: 1 }, { unique: true });
ratingSchema.index({ volunteer: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
