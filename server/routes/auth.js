const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const Community = require('../models/Community');
const CommunityMembership = require('../models/CommunityMembership');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Helper to sign JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.globalRole }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      globalRole: user.globalRole,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified
    }
  });
};

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, role, communityName, communityDescription } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Email, password, and full name are required.',
        correlationId: req.correlationId
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
        correlationId: req.correlationId
      });
    }

    const globalRole = (role === 'organizer') ? 'organizer' : 'volunteer';
    const user = new User({
      email,
      password,
      name,
      phone,
      globalRole,
      isEmailVerified: true // Set verified for demo ease
    });

    await user.save();

    // If volunteer, create empty volunteer profile
    if (globalRole === 'volunteer') {
      await VolunteerProfile.create({
        user: user._id,
        skills: req.body.skills || [],
        interests: req.body.interests || [],
        city: req.body.city || 'Imphal'
      });
    }

    // If organizer, optionally create community if provided
    if (globalRole === 'organizer' && communityName) {
      const slug = communityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const community = await Community.create({
        name: communityName,
        slug: slug || `comm-${Date.now()}`,
        description: communityDescription || 'Dedicated community driving positive local impact.',
        createdBy: user._id,
        status: 'approved'
      });

      await CommunityMembership.create({
        user: user._id,
        community: community._id,
        role: 'organizer',
        status: 'active'
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Please provide email and password.',
        correlationId: req.correlationId
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        correlationId: req.correlationId
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        correlationId: req.correlationId
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let volunteerProfile = null;
    let memberships = [];

    if (user.globalRole === 'volunteer') {
      volunteerProfile = await VolunteerProfile.findOne({ user: user._id });
    }

    memberships = await CommunityMembership.find({ user: user._id, status: 'active' })
      .populate('community', 'name slug logo status isVerified');

    res.status(200).json({
      success: true,
      user,
      volunteerProfile,
      memberships
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been dispatched.'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset instructions dispatched.',
      demoResetToken: resetToken // provided for developer convenience in testing
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Token and newPassword are required.',
        correlationId: req.correlationId
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Password reset token is invalid or has expired.',
        correlationId: req.correlationId
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
