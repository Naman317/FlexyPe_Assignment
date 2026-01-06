const ReservationService = require('../services/ReservationService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { validateSkU, validateQuantity, validateUserId, validateReservationId } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

class ReservationController {
  /**
   * POST /inventory/reserve
   * Reserve inventory for checkout
   */
  async reserve(req, res) {
    try {
      const { userId, sku, quantity } = req.body;

      // Validation
      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, userValidation.error);
      }

      const skuValidation = validateSkU(sku);
      if (!skuValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, skuValidation.error);
      }

      const quantityValidation = validateQuantity(quantity);
      if (!quantityValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, quantityValidation.error);
      }

      const result = await ReservationService.reserve(userId, sku, quantity);
      if (!result.success) {
        return sendError(
          res,
          result.availableQuantity !== undefined ? HTTP_STATUS.CONFLICT : HTTP_STATUS.NOT_FOUND,
          result.error
        );
      }

      return sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        {
          ...result.data.toObject(),
          expiresIn: result.expiresIn,
        },
        'Inventory reserved successfully'
      );
    } catch (error) {
      logger.error('Error in reserve controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * GET /reservation/{reservationId}
   * Get reservation details
   */
  async getReservation(req, res) {
    try {
      const { reservationId } = req.params;

      const validation = validateReservationId(reservationId);
      if (!validation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
      }

      const result = await ReservationService.getReservation(reservationId);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, result.error);
      }

      return sendSuccess(res, HTTP_STATUS.SUCCESS, result.data);
    } catch (error) {
      logger.error('Error in getReservation controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * POST /inventory/reserve/cancel
   * Cancel reservation
   */
  async cancel(req, res) {
    try {
      const { reservationId } = req.body;

      const validation = validateReservationId(reservationId);
      if (!validation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
      }

      const result = await ReservationService.cancel(reservationId);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, result.error);
      }

      return sendSuccess(res, HTTP_STATUS.SUCCESS, result.data, 'Reservation cancelled successfully');
    } catch (error) {
      logger.error('Error in cancel controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }
}

module.exports = new ReservationController();
