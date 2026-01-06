const CheckoutService = require('../services/CheckoutService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { validateReservationId, validateUserId } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

class CheckoutController {
  /**
   * POST /checkout/confirm
   * Confirm checkout and finalize order
   */
  async confirm(req, res) {
    try {
      const { reservationId, orderId, userId } = req.body;

      // Validation
      const reservationValidation = validateReservationId(reservationId);
      if (!reservationValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, reservationValidation.error);
      }

      if (!orderId || typeof orderId !== 'string') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Order ID is required');
      }

      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, userValidation.error);
      }

      const result = await CheckoutService.confirm(orderId, reservationId);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.CONFLICT, result.error);
      }

      return sendSuccess(
        res,
        HTTP_STATUS.SUCCESS,
        result.data,
        'Checkout confirmed successfully'
      );
    } catch (error) {
      logger.error('Error in confirm controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * POST /checkout/cancel
   * Cancel checkout
   */
  async cancel(req, res) {
    try {
      const { orderId, reservationId } = req.body;

      if (!orderId || typeof orderId !== 'string') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Order ID is required');
      }

      const result = await CheckoutService.cancel(orderId, reservationId);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, result.error);
      }

      return sendSuccess(
        res,
        HTTP_STATUS.SUCCESS,
        result.data,
        'Checkout cancelled successfully'
      );
    } catch (error) {
      logger.error('Error in cancel controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * GET /order/{orderId}
   * Get order details
   */
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId || typeof orderId !== 'string') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Order ID is required');
      }

      const result = await CheckoutService.getOrder(orderId);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, result.error);
      }

      return sendSuccess(res, HTTP_STATUS.SUCCESS, result.data);
    } catch (error) {
      logger.error('Error in getOrder controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }
}

module.exports = new CheckoutController();
