const ReservationRepository = require('../repositories/ReservationRepository');
const InventoryRepository = require('../repositories/InventoryRepository');
const { RESERVATION_CONFIG, ERROR_MESSAGES } = require('../config/constants');
const logger = require('../utils/logger');

class ReservationService {
 
  async reserve(userId, sku, quantity) {
    try {
      // Check for existing reservation
      const existingReservation = await ReservationRepository.getBySkUAndUserId(sku, userId);
      if (existingReservation) {
        logger.info('Returning existing reservation (idempotent)', {
          userId,
          sku,
          reservationId: existingReservation.reservationId,
        });
        return {
          success: true,
          data: existingReservation,
          isIdempotent: true,
        };
      }

      //  inventory availability
      const inventory = await InventoryRepository.getBySkU(sku);
      if (!inventory) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      if (inventory.availableQuantity < quantity) {
        return {
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_INVENTORY,
          availableQuantity: inventory.availableQuantity,
        };
      }

      // Create reservation with TTL
      const expiresAt = new Date(Date.now() + RESERVATION_CONFIG.TTL_MS);
      const reservation = await ReservationRepository.create(userId, sku, quantity, expiresAt);

      // Update inventory - reserve the quantity
      await InventoryRepository.increaseReserved(sku, quantity);

      logger.info('Reservation created', {
        reservationId: reservation.reservationId,
        userId,
        sku,
        quantity,
        expiresAt,
      });

      return {
        success: true,
        data: reservation,
        expiresIn: RESERVATION_CONFIG.TTL_MS,
      };
    } catch (error) {
      logger.error('Error reserving inventory', {
        userId,
        sku,
        quantity,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get reservation details
   */
  async getReservation(reservationId) {
    try {
      const reservation = await ReservationRepository.getByReservationId(reservationId);
      if (!reservation) {
        return {
          success: false,
          error: ERROR_MESSAGES.RESERVATION_NOT_FOUND,
        };
      }

      // Check if reservation has expired
      if (reservation.status === 'RESERVED' && new Date() > reservation.expiresAt) {
        // Mark as expired
        await ReservationRepository.updateStatus(reservationId, 'EXPIRED');
        return {
          success: false,
          error: ERROR_MESSAGES.RESERVATION_EXPIRED,
        };
      }

      return {
        success: true,
        data: reservation,
      };
    } catch (error) {
      logger.error('Error getting reservation', { reservationId, error: error.message });
      throw error;
    }
  }

  /**
   * Cancel reservation and free up inventory
   */
  async cancel(reservationId) {
    try {
      const reservation = await ReservationRepository.getByReservationId(reservationId);
      if (!reservation) {
        return {
          success: false,
          error: ERROR_MESSAGES.RESERVATION_NOT_FOUND,
        };
      }

      if (reservation.status !== 'RESERVED') {
        return {
          success: false,
          error: `Cannot cancel reservation with status: ${reservation.status}`,
        };
      }

      // Free up reserved inventory
      await InventoryRepository.decreaseReserved(reservation.sku, reservation.quantity);

      // Update reservation status
      const updatedReservation = await ReservationRepository.cancel(reservationId);

      logger.info('Reservation cancelled', {
        reservationId,
        sku: reservation.sku,
        quantity: reservation.quantity,
      });

      return {
        success: true,
        data: updatedReservation,
      };
    } catch (error) {
      logger.error('Error cancelling reservation', { reservationId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if reservation is still valid
   */
  async isValid(reservationId) {
    try {
      const reservation = await ReservationRepository.getByReservationId(reservationId);
      if (!reservation) {
        return false;
      }

      if (reservation.status !== 'RESERVED') {
        return false;
      }

      if (new Date() > reservation.expiresAt) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking reservation validity', { reservationId, error: error.message });
      throw error;
    }
  }

  //Clean expiry rservations
  async cleanupExpiredReservations() {
    try {
      const now = new Date();
      
      // Find all expired reservations with RESERVED status
      const expiredReservations = await ReservationRepository.getExpired(now);
      let cleaned = 0;

      for (const reservation of expiredReservations) {
        // Free up inventory
        try {
          await InventoryRepository.decreaseReserved(
            reservation.sku,
            reservation.quantity
          );
          // Mark as expired
          await ReservationRepository.updateStatus(reservation.reservationId, 'EXPIRED');
          cleaned++;
          
          logger.debug('Expired reservation cleaned', {
            reservationId: reservation.reservationId,
            sku: reservation.sku,
            quantity: reservation.quantity,
          });
        } catch (error) {
          logger.error('Error cleaning up single reservation', {
            reservationId: reservation.reservationId,
            error: error.message,
          });
        }
      }

      if (cleaned > 0) {
        logger.info('Cleanup completed', { expiredReservations: cleaned });
      }

      return cleaned;
    } catch (error) {
      logger.error('Error cleaning up expired reservations', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ReservationService();
