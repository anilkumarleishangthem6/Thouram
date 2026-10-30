const express = require('express');
const router = express.Router();
const VolunteerProfile = require('../models/VolunteerProfile');
const Assignment = require('../models/Assignment');
const Application = require('../models/Application');
const Event = require('../models/Event');
const Rating = require('../models/Rating');
const { authenticate } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matching');

// GET /api/v1/volunteers/profile - Get current volunteer's profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    let profile = await VolunteerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await VolunteerProfile.create({
        user: req.user._id,
        skills: [],
        interests: []
      });
    }

    // Get verified ratings
    const ratings = await Rating.find({ volunteer: req.user._id })
      .populate('event', 'title')
      .populate('ratedBy', 'name');

    res.status(200).json({
      success: true,
      profile,
      user: req.user,
      ratings
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/volunteers/profile - Update volunteer profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const {
      bio,
      skills,
      interests,
      availability,
      languages,
      location,
      city,
      travelRadiusKm,
      accessibilityPreferences,
      phone
    } = req.body;

    let profile = await VolunteerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new VolunteerProfile({ user: req.user._id });
    }

    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (interests !== undefined) profile.interests = interests;
    if (availability !== undefined) profile.availability = availability;
    if (languages !== undefined) profile.languages = languages;
    if (accessibilityPreferences !== undefined) profile.accessibilityPreferences = accessibilityPreferences;
    
        if (!profile.location) profile.location = {};
        if (city !== undefined) profile.location.city = city;
        if (travelRadiusKm !== undefined) profile.location.travelRadiusKm = travelRadiusKm;
        if (location?.city !== undefined) profile.location.city = location.city;
        if (location?.area !== undefined) profile.location.area = location.area;
        if (location?.travelRadiusKm !== undefined) profile.location.travelRadiusKm = location.travelRadiusKm;
    
        if (location?.coordinates) {
          profile.location.type = 'Point';
          profile.location.coordinates = location.coordinates;
        }
    
        let points = 20;
        if (profile.bio && profile.bio.length > 10) points += 20;
        if (profile.skills && profile.skills.length > 0) points += 20;
        if (profile.interests && profile.interests.length > 0) points += 20;
        if (profile.location?.city) points += 10;
        if (profile.languages && profile.languages.length > 0) points += 10;
        profile.profileCompletionPercent = Math.min(100, points);
    
        await profile.save();
    
        if (req.body.name) {
          req.user.name = req.body.name;
        }
        if (phone !== undefined) {
          req.user.phone = phone;
        }
        await req.user.save();

    res.status(200).json({
      success: true,
      profile,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/volunteers/dashboard - Aggregated volunteer dashboard
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findOne({ user: req.user._id });

    // Upcoming assignments (confirmed or checked-in)
    const upcomingAssignments = await Assignment.find({
      volunteer: req.user._id,
      status: { $in: ['confirmed', 'checked-in'] }
    })
      .populate({
        path: 'event',
        populate: { path: 'community', select: 'name logo isVerified' }
      })
      .sort({ createdAt: -1 });

    // Pending Invitations (status: 'assigned')
    const invitations = await Assignment.find({
      volunteer: req.user._id,
      status: 'assigned'
    })
      .populate({
        path: 'event',
        populate: { path: 'community', select: 'name logo isVerified' }
      });

    // Waitlisted / Backup Assignments
    const waitlisted = await Assignment.find({
      volunteer: req.user._id,
      status: 'waitlisted'
    })
      .populate({
        path: 'event',
        populate: { path: 'community', select: 'name logo isVerified' }
      });

    // Recent Completed Assignments with verified hours
    const completedAssignments = await Assignment.find({
      volunteer: req.user._id,
      status: 'completed'
    })
      .populate({
        path: 'event',
        populate: { path: 'community', select: 'name logo isVerified' }
      })
      .limit(5);

    // Calculate total verified hours
    const totalHoursAgg = await Assignment.aggregate([
      { $match: { volunteer: req.user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$verifiedHours' } } }
    ]);
    const verifiedHours = totalHoursAgg[0]?.total || profile?.metrics?.verifiedHoursTotal || 0;

    // Recommended Events
    const openEvents = await Event.find({ status: 'published' })
      .populate('community', 'name logo isVerified')
      .limit(10);

    const recommendedEvents = openEvents.map(event => {
      const match = calculateMatchScore(profile, event, event.duties?.[0]);
      return {
        ...event.toObject(),
        matchScore: match.totalScore,
        matchBreakdown: match
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

    res.status(200).json({
      success: true,
      profile,
      metrics: {
        verifiedHoursTotal: verifiedHours,
        eventsCompleted: completedAssignments.length,
        reliabilityScore: profile?.metrics?.reliabilityScore ?? 98,
        ratingAverage: profile?.metrics?.averageRating ?? 4.9
      },
      upcomingAssignments,
      invitations,
      waitlisted,
      completedAssignments,
      recommendedEvents
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/volunteers/my-events - Filtered list of volunteer's events
router.get('/my-events', authenticate, async (req, res, next) => {
  try {
    const { tab = 'upcoming' } = req.query; // 'upcoming', 'applications', 'waitlisted', 'completed'

    let statusFilter = [];
    if (tab === 'upcoming') {
      statusFilter = ['confirmed', 'checked-in'];
    } else if (tab === 'applications') {
      statusFilter = ['assigned'];
    } else if (tab === 'waitlisted') {
      statusFilter = ['waitlisted'];
    } else if (tab === 'completed') {
      statusFilter = ['completed'];
    } else {
      statusFilter = ['confirmed', 'assigned', 'waitlisted', 'checked-in', 'completed'];
    }

    const assignments = await Assignment.find({
      volunteer: req.user._id,
      status: { $in: statusFilter }
    })
      .populate({
        path: 'event',
        populate: { path: 'community', select: 'name logo isVerified' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tab,
      assignments
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
