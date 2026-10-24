const mongoose = require('mongoose');

const communityMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  role: {
    type: String,
    enum: ['creator', 'admin', 'organizer', 'sub-manager', 'member', 'volunteer'],
    default: 'member'
  },
  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

communityMembershipSchema.index({ user: 1, community: 1 }, { unique: true });
communityMembershipSchema.index({ community: 1, role: 1 });

module.exports = mongoose.model('CommunityMembership', communityMembershipSchema);
