const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Assignment = require('../models/Assignment');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/roster/events/:id - Get complete event roster
router.get('/events/:id', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('community');
    if (!event) return res.status(404).json({ code: 'NOT_FOUND', message: 'Event not found' });

    // Fetch all assignments for this event
    const assignments = await Assignment.find({ event: event._id })
      .populate('volunteer', 'name email avatarUrl phone')
      .populate('assignedBy', 'name')
      .populate('subManager', 'name')
      .sort({ waitlistPosition: 1, createdAt: 1 });

    const confirmed = assignments.filter(a => ['confirmed', 'checked-in', 'checked-out', 'completed'].includes(a.status));
    const waitlisted = assignments.filter(a => a.status === 'waitlisted' || a.isBackup);
    const pendingInvites = assignments.filter(a => a.status === 'assigned');
    const cancelled = assignments.filter(a => a.status === 'cancelled');

    // Aggregate statistics
    const stats = {
      totalRequired: event.capacity.totalRequired,
      confirmedCount: confirmed.length,
      waitlistedCount: waitlisted.length,
      backupTarget: event.capacity.backupCount,
      checkedInCount: assignments.filter(a => ['checked-in', 'checked-out', 'completed'].includes(a.status)).length
    };

    res.status(200).json({
      success: true,
      event,
      stats,
      roster: {
        confirmed,
        waitlisted,
        pendingInvites,
        cancelled
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/roster/promote/:assignmentId - Manually promote backup volunteer
router.post('/promote/:assignmentId', authenticate, async (req, res, next) => {
  try {
    const { overrideReason } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('volunteer', 'name email')
      .populate('event');

    if (!assignment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });

    const previousStatus = assignment.status;
    assignment.status = 'confirmed';
    assignment.isBackup = false;
    assignment.promotedAt = new Date();
    assignment.assignedBy = req.user._id;
    if (overrideReason) assignment.overrideReason = overrideReason;
    await assignment.save();

    // Update event capacity
    const event = await Event.findById(assignment.event._id);
    if (event) {
      event.capacity.confirmed += 1;
      if (event.capacity.waitlisted > 0) event.capacity.waitlisted -= 1;
      await event.save();
    }

    await AuditLog.create({
      action: 'backup_promotion',
      actor: req.user._id,
      entityType: 'Assignment',
      entityId: assignment._id,
      event: assignment.event._id,
      details: {
        volunteer: assignment.volunteer._id,
        previousStatus,
        newStatus: 'confirmed',
        manual: true
      },
      reason: overrideReason || 'Manual promotion by organizer'
    });

    await Notification.create({
      user: assignment.volunteer._id,
      title: 'You are Confirmed for the Event!',
      message: `You have been promoted to confirmed volunteer for "${assignment.event.title}". Access your event pass now!`,
      type: 'backup_promotion',
      relatedEvent: assignment.event._id,
      relatedAssignment: assignment._id
    });

    res.status(200).json({
      success: true,
      message: 'Volunteer successfully promoted to confirmed status.',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/roster/assign-duty - Assign volunteer to duty/team or delegate sub-manager
router.post('/assign-duty', authenticate, async (req, res, next) => {
  try {
    const { assignmentId, dutyId, dutyTitle, team, subManagerId, overrideReason } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });

    const previousDuty = assignment.dutyTitle;
    const previousTeam = assignment.team;

    if (dutyId) assignment.duty = dutyId;
    if (dutyTitle) assignment.dutyTitle = dutyTitle;
    if (team) assignment.team = team;
    if (subManagerId) assignment.subManager = subManagerId;
    if (overrideReason) assignment.overrideReason = overrideReason;

    await assignment.save();

    await AuditLog.create({
      action: 'assignment_override',
      actor: req.user._id,
      entityType: 'Assignment',
      entityId: assignment._id,
      event: assignment.event,
      previousState: { dutyTitle: previousDuty, team: previousTeam },
      newState: { dutyTitle: assignment.dutyTitle, team: assignment.team },
      reason: overrideReason || 'Duty/team assignment updated'
    });

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/roster/accept-promotion/:id - Volunteer accepts promotion
router.post('/accept-promotion/:id', authenticate, async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      volunteer: req.user._id
    }).populate('event');

    if (!assignment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });

    assignment.status = 'confirmed';
    assignment.isBackup = false;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Promotion accepted! You are now confirmed for this event.',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
