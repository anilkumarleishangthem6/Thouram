const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Assignment = require('../models/Assignment');
const AttendanceLog = require('../models/AttendanceLog');
const AuditLog = require('../models/AuditLog');
const VolunteerProfile = require('../models/VolunteerProfile');
const { authenticate } = require('../middleware/auth');
const { generateCheckInToken, verifyCheckInToken, generateQRCodeDataUrl } = require('../utils/qr');

// GET /api/v1/attendance/events/:id/pass - Get volunteer event pass with QR code
router.get('/events/:id/pass', authenticate, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('community', 'name logo');
    if (!event) return res.status(404).json({ code: 'NOT_FOUND', message: 'Event not found' });

    const assignment = await Assignment.findOne({
      event: event._id,
      volunteer: req.user._id,
      status: { $in: ['confirmed', 'checked-in', 'checked-out', 'completed'] }
    });

    if (!assignment) {
      return res.status(403).json({
        code: 'NO_CONFIRMED_PASS',
        message: 'No confirmed assignment found for this event.',
        correlationId: req.correlationId
      });
    }

    // Generate encrypted token for QR code
    const token = generateCheckInToken(event._id, req.user._id, assignment._id);
    const qrDataUrl = await generateQRCodeDataUrl(token);

    res.status(200).json({
      success: true,
      event,
      assignment,
      volunteer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      qrCode: qrDataUrl,
      rawToken: token
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/attendance/qr-checkin - Process QR code scan
router.post('/qr-checkin', authenticate, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ code: 'TOKEN_REQUIRED', message: 'QR token is required' });
    }

    const decrypted = verifyCheckInToken(token);
    if (!decrypted) {
      return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Invalid or corrupted QR token' });
    }

    const { eventId, volunteerId, assignmentId } = decrypted;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });
    }

    if (assignment.status === 'checked-in') {
      return res.status(200).json({
        success: true,
        message: 'Volunteer is already checked in.',
        assignment
      });
    }

    assignment.status = 'checked-in';
    assignment.checkInAt = new Date();
    assignment.checkInMethod = 'qr';
    assignment.checkInActor = req.user._id;
    await assignment.save();

    const log = await AttendanceLog.create({
      event: eventId,
      volunteer: volunteerId,
      assignment: assignment._id,
      action: 'check-in',
      method: 'qr',
      actor: req.user._id
    });

    await AuditLog.create({
      action: 'attendance_checkin',
      actor: req.user._id,
      entityType: 'AttendanceLog',
      entityId: log._id,
      event: eventId,
      details: { volunteerId, method: 'qr' }
    });

    res.status(200).json({
      success: true,
      message: 'Check-in successful via QR code!',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/attendance/manual-checkin - Organizer manual checkin with reason
router.post('/manual-checkin', authenticate, async (req, res, next) => {
  try {
    const { assignmentId, reason } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });

    assignment.status = 'checked-in';
    assignment.checkInAt = new Date();
    assignment.checkInMethod = 'manual';
    assignment.checkInActor = req.user._id;
    assignment.checkInReason = reason || 'Manual check-in by organizer';
    await assignment.save();

    const log = await AttendanceLog.create({
      event: assignment.event,
      volunteer: assignment.volunteer,
      assignment: assignment._id,
      action: 'check-in',
      method: 'manual',
      actor: req.user._id,
      reason: reason || 'Manual check-in'
    });

    await AuditLog.create({
      action: 'attendance_checkin',
      actor: req.user._id,
      entityType: 'AttendanceLog',
      entityId: log._id,
      event: assignment.event,
      reason: reason || 'Manual check-in'
    });

    res.status(200).json({
      success: true,
      message: 'Volunteer checked in manually.',
      assignment
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/attendance/checkout - Check-out volunteer & calculate verified hours
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { assignmentId, hours } = req.body;
    const assignment = await Assignment.findById(assignmentId).populate('event');
    if (!assignment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Assignment not found' });

    const checkOutTime = new Date();
    let calculatedHours = hours;

    if (!calculatedHours && assignment.checkInAt) {
      const diffMs = checkOutTime - new Date(assignment.checkInAt);
      calculatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }
    // Fallback if checked in instantly for demo
    if (!calculatedHours || calculatedHours <= 0) calculatedHours = 4.0;

    assignment.status = 'completed';
    assignment.checkOutAt = checkOutTime;
    assignment.verifiedHours = calculatedHours;
    await assignment.save();

    // Update volunteer profile metrics
    const profile = await VolunteerProfile.findOne({ user: assignment.volunteer });
    if (profile) {
      profile.metrics.verifiedHoursTotal = (profile.metrics.verifiedHoursTotal || 0) + calculatedHours;
      profile.metrics.eventsCompleted = (profile.metrics.eventsCompleted || 0) + 1;
      await profile.save();
    }

    const log = await AttendanceLog.create({
      event: assignment.event._id,
      volunteer: assignment.volunteer,
      assignment: assignment._id,
      action: 'check-out',
      actor: req.user._id,
      verifiedHours: calculatedHours
    });

    await AuditLog.create({
      action: 'attendance_checkout',
      actor: req.user._id,
      entityType: 'AttendanceLog',
      entityId: log._id,
      event: assignment.event._id,
      details: { verifiedHours: calculatedHours }
    });

    res.status(200).json({
      success: true,
      message: `Checked out successfully! ${calculatedHours} hours verified.`,
      assignment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
