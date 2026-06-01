// Central custom error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  console.error(err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const message = 'User already exists with this email';
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token, authorization denied' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

module.exports = errorHandler;
