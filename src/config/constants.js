//  configuration
const RESERVATION_CONFIG = {
  TTL_MS: parseInt(process.env.RESERVATION_TTL) || 5 * 60 * 1000, // 5 minutes default
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute cleanup interval
};

// API  codes
const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// Error msg
const ERROR_MESSAGES = {
  INSUFFICIENT_INVENTORY: 'Insufficient inventory available',
  RESERVATION_EXPIRED: 'Reservation has expired',
  RESERVATION_NOT_FOUND: 'Reservation not found',
  INVALID_SKU: 'Invalid SKU provided',
  INVALID_QUANTITY: 'Invalid quantity provided',
  CHECKOUT_FAILED: 'Checkout failed',
  INTERNAL_ERROR: 'Internal server error',
};

module.exports = {
  RESERVATION_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
