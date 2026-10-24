const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Duty = require('../models/Event'); // Duties are embedded in Event schema
const Application = require('../models/Application');
const Assignment = require('../models/Assignment');
const VolunteerProfile = require('../models/VolunteerProfile');
const CommunityMembership = require('../models/CommunityMembership');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matching');

// GET /api/v1/events - Search & explore events
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      cause,
      city,
      isVirtual,
      startDate,
      status,
      skill,
      limit = 20,
      page = 1
    } = req.query;

    const query = {};

    // By default, public search only returns published events unless organizer specifies
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cause: { $regex: search, $options: 'i' } }
      ];
    }

    if (cause) {
      query.cause = { $regex: cause, $options: 'i' };
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (isVirtual !== undefined) {
      query['location.isVirtual'] = isVirtual === 'true';
    }

    if (startDate) {
      query['dateTime.start'] = { $gte: new Date(startDate) };
    }

    if (skill) {
      query.$or = [
        { tags: { $in: [new RegExp(skill, 'i')] } },
        { 'duties.requiredSkills': { $in: [new RegExp(skill, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('community', 'name slug logo isVerified')
      .sort({ 'dateTime.start': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events,
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

// GET /api/v1/events/:id - Get event details
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('community')
      .populate('createdBy', 'name email avatarUrl');

    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found with provided ID.',
        correlationId: req.correlationId
      });
    }

    let userAssignment = null;
    let userApplication = null;
    let matchBreakdown = null;

    if (req.user) {
      userAssignment = await Assignment.findOne({
        event: event._id,
        volunteer: req.user._id,
        status: { $ne: 'cancelled' }
      });

      userApplication = await Application.findOne({
        event: event._id,
        volunteer: req.user._id
      });

      // Calculate volunteer recommendation match score
      const profile = await VolunteerProfile.findOne({ user: req.user._id });
      if (profile) {
        matchBreakdown = calculateMatchScore(profile, event, event.duties?.[0]);
      }
    }

    res.status(200).json({
      success: true,
      event,
      userAssignment,
      userApplication,
      matchBreakdown
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events - Create new event
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      communityId,
      title,
      description,
      cause,
      location,
      dateTime,
      duties = [],
      volunteerInstructions,
      whatToBring,
      providedOnSite,
      safety,
      tags,
      imageUrl
    } = req.body;

    if (!title || !dateTime?.start || !dateTime?.end || !communityId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Community ID, title, start date, and end date are required.',
        correlationId: req.correlationId
      });
    }

    // Check membership authorization
    const membership = await CommunityMembership.findOne({
      user: req.user._id,
      community: communityId,
      role: { $in: ['organizer', 'sub-manager', 'team-lead'] },
      status: 'active'
    });

    if (!membership && req.user.globalRole !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to create events for this community.',
        correlationId: req.correlationId
      });
    }

    // Compute total required volunteers from duties
    let totalRequired = 0;
    duties.forEach(d => {
      totalRequired += Number(d.volunteersRequired || 1);
    });
    if (totalRequired === 0) totalRequired = Number(req.body.totalRequired || 10);

    const backupCount = Math.ceil(totalRequired * 0.10);

    const newEvent = new Event({
      community: communityId,
      createdBy: req.user._id,
      title,
      description,
      cause,
      status: req.body.status || 'published',
      location,
      dateTime,
      duties,
      capacity: {
        totalRequired,
        confirmed: 0,
        waitlisted: 0,
        backupCount
      },
      volunteerInstructions,
      whatToBring,
      providedOnSite,
      safety,
      tags,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200',
      publishedAt: req.body.status === 'published' ? new Date() : undefined
    });

    await newEvent.save();

    // Audit log
    await AuditLog.create({
      action: 'event_create',
      actor: req.user._id,
      entityType: 'Event',
      entityId: newEvent._id,
      community: communityId,
      event: newEvent._id,
      details: { title, totalRequired, backupCount }
    });

    res.status(201).json({
      success: true,
      event: newEvent
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/events/:id - Update event details
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found',
        correlationId: req.correlationId
      });
    }

    // Verify permission
    const membership = await CommunityMembership.findOne({
      user: req.user._id,
      community: event.community,
      role: { $in: ['organizer', 'sub-manager'] },
      status: 'active'
    });

    if (!membership && req.user.globalRole !== 'admin') {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Not authorized to edit this event.',
        correlationId: req.correlationId
      });
    }

    const previousState = event.toObject();
    Object.assign(event, req.body);

    if (req.body.duties) {
      let total = 0;
      event.duties.forEach(d => { total += Number(d.volunteersRequired || 1); });
      event.capacity.totalRequired = total;
      event.capacity.backupCount = Math.ceil(total * 0.10);
    }

    await event.save();

    await AuditLog.create({
      action: 'event_update',
      actor: req.user._id,
      entityType: 'Event',
      entityId: event._id,
      community: event.community,
      event: event._id,
      previousState: { title: previousState.title, status: previousState.status },
      newState: { title: event.title, status: event.status },
      reason: req.body.updateReason || 'Organizer update'
    });

    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/events/:id/status - Change status (publish, pause, cancel, close, complete)
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found.',
        correlationId: req.correlationId
      });
    }

    const previousStatus = event.status;
    event.status = status;
    if (status === 'closed') event.closedAt = new Date();
    if (status === 'published' && !event.publishedAt) event.publishedAt = new Date();
    await event.save();

    await AuditLog.create({
      action: 'event_status_change',
      actor: req.user._id,
      entityType: 'Event',
      entityId: event._id,
      community: event.community,
      event: event._id,
      previousState: { status: previousStatus },
      newState: { status },
      reason: cancellationReason || 'Status changed by organizer'
    });

    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/apply - Volunteer applies for duty
router.post('/:id/apply', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found.',
        correlationId: req.correlationId
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        code: 'EVENT_NOT_OPEN',
        message: `Cannot apply to an event with status: ${event.status}`,
        correlationId: req.correlationId
      });
    }

    const { dutyId, preferredDutyTitle, motivation, idempotencyKey } = req.body;

    // Check existing assignment or application
    const existingAssignment = await Assignment.findOne({
      event: event._id,
      volunteer: req.user._id,
      status: { $ne: 'cancelled' }
    });

    if (existingAssignment) {
      return res.status(409).json({
        code: 'ALREADY_ASSIGNED',
        message: `You are already registered for this event (Status: ${existingAssignment.status}).`,
        assignment: existingAssignment,
        correlationId: req.correlationId
      });
    }

    // Match breakdown
    const profile = await VolunteerProfile.findOne({ user: req.user._id });
    const selectedDuty = event.duties.find(d => d._id.toString() === dutyId) || event.duties[0];
    const matchBreakdown = calculateMatchScore(profile, event, selectedDuty);

    // Create or update application
    let application = await Application.findOne({
      event: event._id,
      volunteer: req.user._id
    });

    if (!application) {
      application = new Application({
        event: event._id,
        volunteer: req.user._id,
        duty: dutyId || selectedDuty?._id,
        preferredDutyTitle: preferredDutyTitle || selectedDuty?.title || 'General Volunteer',
        motivation,
        matchScore: matchBreakdown.totalScore,
        matchBreakdown,
        idempotencyKey: idempotencyKey || `apply-${req.user._id}-${event._id}-${Date.now()}`
      });
      await application.save();
    }

    // Determine if auto-assigned or placed on waitlist/backups
    let isBackup = false;
    let assignmentStatus = 'confirmed';
    let waitlistPos = null;

    if (event.capacity.confirmed >= event.capacity.totalRequired) {
      // Confirmed slots are full, place in backup waitlist
      isBackup = true;
      assignmentStatus = 'waitlisted';
      event.capacity.waitlisted += 1;
      waitlistPos = event.capacity.waitlisted;
    } else {
      event.capacity.confirmed += 1;
      if (selectedDuty) {
        selectedDuty.volunteersConfirmed = (selectedDuty.volunteersConfirmed || 0) + 1;
      }
    }
    await event.save();

    const assignment = await Assignment.create({
      event: event._id,
      volunteer: req.user._id,
      duty: dutyId || selectedDuty?._id,
      dutyTitle: preferredDutyTitle || selectedDuty?.title || 'General Volunteer',
      status: assignmentStatus,
      isBackup,
      waitlistPosition: waitlistPos,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}-assignment` : undefined
    });

    application.status = isBackup ? 'waitlisted' : 'accepted';
    await application.save();

    // Create user notification
    await Notification.create({
      user: req.user._id,
      title: isBackup ? 'Waitlisted as Backup' : 'Application Confirmed!',
      message: isBackup
        ? `You are on the backup waitlist for "${event.title}" at position #${waitlistPos}. You will be promoted if a volunteer cancels.`
        : `You are confirmed as volunteer for "${event.title}"! Check your event pass.`,
      type: 'application_status',
      relatedEvent: event._id,
      relatedAssignment: assignment._id
    });

    res.status(201).json({
      success: true,
      message: isBackup ? 'Added to backup waitlist' : 'Confirmed for event',
      assignment,
      application
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/withdraw - Volunteer withdraws
router.post('/:id/withdraw', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 'EVENT_NOT_FOUND', message: 'Event not found' });
    }

    const assignment = await Assignment.findOne({
      event: event._id,
      volunteer: req.user._id,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (!assignment) {
      return res.status(400).json({
        code: 'NOT_REGISTERED',
        message: 'No active registration found for this event.',
        correlationId: req.correlationId
      });
    }

    const wasConfirmed = (assignment.status === 'confirmed');
    assignment.status = 'cancelled';
    assignment.cancelledAt = new Date();
    assignment.cancellationReason = reason || 'Withdrawn by volunteer';
    await assignment.save();

    if (wasConfirmed && event.capacity.confirmed > 0) {
      event.capacity.confirmed = Math.max(0, event.capacity.confirmed - 1);
    } else if (assignment.isBackup && event.capacity.waitlisted > 0) {
      event.capacity.waitlisted = Math.max(0, event.capacity.waitlisted - 1);
    }
    await event.save();

    await AuditLog.create({
      action: 'cancellation',
      actor: req.user._id,
      entityType: 'Assignment',
      entityId: assignment._id,
      event: event._id,
      community: event.community,
      reason: reason || 'Volunteer withdrawal'
    });

    // If a confirmed volunteer cancelled, automatically promote the top waitlisted backup!
    if (wasConfirmed) {
      const topBackup = await Assignment.findOne({
        event: event._id,
        isBackup: true,
        status: 'waitlisted'
      }).sort({ waitlistPosition: 1 });

      if (topBackup) {
        topBackup.status = 'assigned'; // awaiting acceptance or auto-promoted
        topBackup.isBackup = false;
        topBackup.promotedAt = new Date();
        topBackup.promotionDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours to accept
        await topBackup.save();

        event.capacity.confirmed += 1;
        event.capacity.waitlisted = Math.max(0, event.capacity.waitlisted - 1);
        await event.save();

        await AuditLog.create({
          action: 'backup_promotion',
          actor: req.user._id,
          entityType: 'Assignment',
          entityId: topBackup._id,
          event: event._id,
          community: event.community,
          details: { promotedVolunteer: topBackup.volunteer }
        });

        // Notify promoted volunteer
        await Notification.create({
          user: topBackup.volunteer,
          title: '🎉 You have been promoted to Confirmed Volunteer!',
          message: `A spot opened up for "${event.title}"! Please confirm your attendance.`,
          type: 'backup_promotion',
          relatedEvent: event._id,
          relatedAssignment: topBackup._id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Successfully withdrawn from event.'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/events/:id/recommendations - Organizer matching recommendations
router.get('/:id/recommendations', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 'EVENT_NOT_FOUND', message: 'Event not found' });
    }

    // Find all volunteer profiles
    const profiles = await VolunteerProfile.find().populate('user', 'name email avatarUrl phone');

    // Filter out volunteers who are already assigned to this event
    const existingAssignments = await Assignment.find({
      event: event._id,
      status: { $ne: 'cancelled' }
    });
    const assignedUserIds = new Set(existingAssignments.map(a => a.volunteer.toString()));

    const recommendations = [];

    for (const profile of profiles) {
      if (!profile.user || assignedUserIds.has(profile.user._id.toString())) {
        continue;
      }

      const match = calculateMatchScore(profile, event, event.duties?.[0]);
      recommendations.push({
        volunteer: profile.user,
        profile: {
          bio: profile.bio,
          skills: profile.skills,
          interests: profile.interests,
          city: profile.city,
          metrics: profile.metrics
        },
        match
      });
    }

    // Sort by highest match score
    recommendations.sort((a, b) => b.match.totalScore - a.match.totalScore);

    res.status(200).json({
      success: true,
      recommendations: recommendations.slice(0, 25)
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/invite - Organizer invites volunteer
router.post('/:id/invite', authenticate, async (req, res, next) => {
  try {
    const { volunteerId, dutyId, dutyTitle } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 'EVENT_NOT_FOUND', message: 'Event not found' });
    }

    // Create assignment in 'assigned' status (pending volunteer acceptance)
    const assignment = await Assignment.create({
      event: event._id,
      volunteer: volunteerId,
      duty: dutyId,
      dutyTitle: dutyTitle || 'Invited Volunteer',
      status: 'assigned',
      assignedBy: req.user._id
    });

    await Notification.create({
      user: volunteerId,
      title: 'Volunteer Invitation!',
      message: `You have been invited to participate in "${event.title}".`,
      type: 'event_invitation',
      relatedEvent: event._id,
      relatedAssignment: assignment._id
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent to volunteer.',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
