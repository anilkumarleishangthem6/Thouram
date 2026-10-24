require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { correlationMiddleware, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const volunteerRoutes = require('./routes/volunteers');
const eventRoutes = require('./routes/events');
const communityRoutes = require('./routes/communities');
const rosterRoutes = require('./routes/roster');
const attendanceRoutes = require('./routes/attendance');
const ratingRoutes = require('./routes/ratings');
const notificationRoutes = require('./routes/notifications');
const auditLogRoutes = require('./routes/auditLogs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thouram';

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret-thouram-2025'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Correlation ID & Logging
app.use(correlationMiddleware);

// Rate limiting for public auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/roster', rosterRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Resource not found at ${req.originalUrl}`,
    correlationId: req.correlationId
  });
});

// Centralized error handler
app.use(errorHandler);

// Database connection & Server initialization
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`[Database] MongoDB connected successfully to ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`[Server] THOURAM API server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch(err => {
    console.error('[Database] MongoDB connection error:', err.message);
    // Allow server to run even if MongoDB isn't running yet (useful during setup/testing)
    app.listen(PORT, () => {
      console.log(`[Server] THOURAM API server running on port ${PORT} (Database pending connection...)`);
    });
  });

module.exports = app;
