const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const CommunityMembership = require('../models/CommunityMembership');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');

// GET /api/v1/communities - List public communities
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { search, isVerified } = req.query;
    const query = { status: 'approved' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    const communities = await Community.find(query).sort({ memberCount: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: communities });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/communities/:slug - Get single community details & events
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name email avatarUrl');

    if (!community) {
      return res.status(404).json({
        code: 'COMMUNITY_NOT_FOUND',
        message: 'Community not found',
        correlationId: req.correlationId
      });
    }

    const events = await Event.find({ community: community._id, status: { $ne: 'draft' } })
      .sort({ 'dateTime.start': 1 });

    let userMembership = null;
    if (req.user) {
      userMembership = await CommunityMembership.findOne({
        user: req.user._id,
        community: community._id,
        status: 'active'
      });
    }

    res.status(200).json({
      success: true,
      community,
      events,
      userMembership
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/communities - Create community
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, mission, location, contactEmail, contactPhone, logo, coverImage } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Community name is required.',
        correlationId: req.correlationId
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `comm-${Date.now()}`;
    
    const existing = await Community.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        code: 'SLUG_EXISTS',
        message: 'A community with a similar name already exists.',
        correlationId: req.correlationId
      });
    }

    const community = await Community.create({
      name,
      slug,
      description,
      mission,
      location,
      contactEmail: contactEmail || req.user.email,
      contactPhone,
      logo,
      coverImage,
      createdBy: req.user._id,
      status: 'approved',
      isVerified: true // Auto-verify demo communities
    });

    await CommunityMembership.create({
      user: req.user._id,
      community: community._id,
      role: 'organizer',
      status: 'active'
    });

    res.status(201).json({ success: true, community });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/communities/:id/members - List members
router.get('/:id/members', authenticate, async (req, res, next) => {
  try {
    const members = await CommunityMembership.find({ community: req.params.id, status: 'active' })
      .populate('user', 'name email avatarUrl phone');

    res.status(200).json({ success: true, members });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/communities/:id/members - Add or invite member with scoped role
router.post('/:id/members', authenticate, async (req, res, next) => {
  try {
    const { email, role = 'sub-manager' } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ code: 'NOT_FOUND', message: 'Community not found' });

    // Verify requesting user is organizer
    const requester = await CommunityMembership.findOne({
      user: req.user._id,
      community: community._id,
      role: 'organizer',
      status: 'active'
    });

    if (!requester && req.user.globalRole !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Only community organizers can manage roles.' });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found with that email.' });
    }

    let membership = await CommunityMembership.findOne({
      user: targetUser._id,
      community: community._id
    });

    const previousRole = membership ? membership.role : null;

    if (membership) {
      membership.role = role;
      membership.status = 'active';
      await membership.save();
    } else {
      membership = await CommunityMembership.create({
        user: targetUser._id,
        community: community._id,
        role,
        status: 'active'
      });
      community.memberCount += 1;
      await community.save();
    }

    await AuditLog.create({
      action: 'role_change',
      actor: req.user._id,
      entityType: 'CommunityMembership',
      entityId: membership._id,
      community: community._id,
      previousState: { role: previousRole },
      newState: { role },
      details: { targetUser: targetUser._id, targetEmail: email }
    });

    res.status(200).json({
      success: true,
      message: `Role assigned successfully: ${role}`,
      membership
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
