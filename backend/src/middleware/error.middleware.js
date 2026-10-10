const multer = require('multer');
const { env } = require('../config/env');

function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.code === 'LIMIT_FILE_SIZE'
        ? `File is too large. Maximum size is ${env.MAX_FILE_SIZE_MB} MB.`
        : error.message,
      errors: [],
    });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : error.message || 'Internal server error.',
    errors: error.errors || [],
  });
}

module.exports = { notFound, errorHandler };
