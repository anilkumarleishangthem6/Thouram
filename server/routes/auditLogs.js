const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/audit-logs
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { eventId, communityId, entityType, limit = 50, page = 1 } = req.query;
    const query = {};

    if (eventId) query.event = eventId;
    if (communityId) query.community = communityId;
    if (entityType) query.entityType = entityType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
