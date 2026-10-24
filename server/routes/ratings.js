const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Rating = require('../models/Rating');
const VolunteerProfile = require('../models/VolunteerProfile');
const Assignment = require('../models/Assignment');
const AuditLog = require('../models/AuditLog');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/ratings/events/:id - Submit volunteer ratings (reliability & work quality)
router.post('/events/:id', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ code: 'NOT_FOUND', message: 'Event not found' });

    const { volunteerId, reliabilityScore, workQualityScore, feedbackNotes } = req.body;

    if (!volunteerId || reliabilityScore === undefined || workQualityScore === undefined) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'volunteerId, reliabilityScore (1-5), and workQualityScore (1-5) are required.'
      });
    }

    const rating = await Rating.findOneAndUpdate(
      { event: event._id, volunteer: volunteerId },
      {
        event: event._id,
        volunteer: volunteerId,
        ratedBy: req.user._id,
        reliabilityScore: Number(reliabilityScore),
        workQualityScore: Number(workQualityScore),
        feedbackNotes
      },
      { upsert: true, new: true }
    );

    // Update volunteer profile metrics
    const allRatings = await Rating.find({ volunteer: volunteerId });
    const avgWorkQuality = allRatings.reduce((sum, r) => sum + r.workQualityScore, 0) / allRatings.length;
    const avgReliability = (allRatings.reduce((sum, r) => sum + r.reliabilityScore, 0) / allRatings.length) * 20; // scale to 100

    const profile = await VolunteerProfile.findOne({ user: volunteerId });
    if (profile) {
      profile.metrics.averageRating = Math.round(avgWorkQuality * 10) / 10;
      profile.metrics.reliabilityScore = Math.round(avgReliability);
      await profile.save();
    }

    await AuditLog.create({
      action: 'rating_submitted',
      actor: req.user._id,
      entityType: 'Rating',
      entityId: rating._id,
      event: event._id,
      details: { volunteerId, reliabilityScore, workQualityScore }
    });

    res.status(200).json({
      success: true,
      message: 'Rating and feedback recorded successfully.',
      rating
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ratings/events/:id - Get event ratings
router.get('/events/:id', authenticate, async (req, res, next) => {
  try {
    const ratings = await Rating.find({ event: req.params.id })
      .populate('volunteer', 'name email avatarUrl')
      .populate('ratedBy', 'name');

    res.status(200).json({ success: true, ratings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
