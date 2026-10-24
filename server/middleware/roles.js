const CommunityMembership = require('../models/CommunityMembership');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
        correlationId: req.correlationId
      });
    }

    if (roles.includes(req.user.globalRole) || req.user.globalRole === 'admin') {
      return next();
    }

    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'You do not have the required permissions for this action.',
      correlationId: req.correlationId
    });
  };
};

const requireCommunityRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          correlationId: req.correlationId
        });
      }

      if (req.user.globalRole === 'admin') {
        return next();
      }

      const communityId = req.params.communityId || req.body.communityId || req.community?._id;
      if (!communityId) {
        return res.status(400).json({
          code: 'MISSING_COMMUNITY',
          message: 'Community context is required for role verification.',
          correlationId: req.correlationId
        });
      }

      const membership = await CommunityMembership.findOne({
        user: req.user._id,
        community: communityId,
        status: 'active'
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: `Action requires one of the following community roles: ${allowedRoles.join(', ')}`,
          correlationId: req.correlationId
        });
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { requireRole, requireCommunityRole };
