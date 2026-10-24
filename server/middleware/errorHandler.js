const { v4: uuidv4 } = require('uuid');

const correlationMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

const errorHandler = (err, req, res, next) => {
  const correlationId = req.correlationId || uuidv4();
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    for (const field in err.errors) {
      fieldErrors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed. Please check the supplied fields.',
      fieldErrors,
      correlationId
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      code: 'DUPLICATE_KEY_ERROR',
      message: `A record with that ${field} already exists.`,
      fieldErrors: { [field]: `${field} must be unique.` },
      correlationId
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: `Invalid format for resource identifier: ${err.value}`,
      correlationId
    });
  }

  // Custom client errors
  const status = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred.' : err.message);

  return res.status(status).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message,
    ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
    correlationId
  });
};

module.exports = { correlationMiddleware, errorHandler };
