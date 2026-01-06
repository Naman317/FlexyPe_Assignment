const logger = require('../utils/logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  logger.info(`Incoming ${req.method} request`, {
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
};

module.exports = requestLogger;
