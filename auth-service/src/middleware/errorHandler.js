// src/middleware/errorHandler.js

/**
 * Global Error Handler Middleware
 * Catches all errors and sends a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Custom Application Error Class
 * Use this to throw errors with custom status codes
 * 
 * Example: throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Handler
 * Place this before errorHandler to catch undefined routes
 */
const notFoundHandler = (req, res, next) => {
  // Silently handle favicon requests (browsers auto-request this)
  if (req.url === '/favicon.ico') {
    return res.status(204).end(); // 204 No Content
  }
  
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = errorHandler;
module.exports.errorHandler = errorHandler;
module.exports.AppError = AppError;
module.exports.notFoundHandler = notFoundHandler;
