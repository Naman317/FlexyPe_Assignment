const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  const message = err.message || 'Internal server error';

  return sendError(res, statusCode, message);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return sendError(res, HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
