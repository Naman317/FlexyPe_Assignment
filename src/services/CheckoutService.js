const OrderRepository = require('../repositories/OrderRepository');
const ReservationRepository = require('../repositories/ReservationRepository');
const InventoryRepository = require('../repositories/InventoryRepository');
const logger = require('../utils/logger');

class CheckoutService {
  /**
   * Create order from reservation
   */
  async createOrder(reservationId, userId) {
    try {
      const reservation = await ReservationRepository.getByReservationId(reservationId);
      if (!reservation) {
        return {
          success: false,
          error: 'Reservation not found',
        };
      }

      if (reservation.status !== 'RESERVED') {
        return {
          success: false,
          error: `Cannot create order from reservation with status: ${reservation.status}`,
        };
      }

      if (new Date() > reservation.expiresAt) {
        return {
          success: false,
          error: 'Reservation has expired',
        };
      }

      // Get inventory to calculate total price
      const inventory = await InventoryRepository.getBySkU(reservation.sku);
      if (!inventory) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      const totalPrice = inventory.price * reservation.quantity;

      // Create order
      const order = await OrderRepository.create(
        userId,
        reservationId,
        reservation.sku,
        reservation.quantity,
        totalPrice
      );

      logger.info('Order created', {
        orderId: order.orderId,
        reservationId,
        userId,
        totalPrice,
      });

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('Error creating order', { reservationId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Confirm checkout - finalize order and consume inventory
   * Idempotent: if already confirmed, return existing confirmation
   */
  async confirm(orderId, reservationId) {
    try {
      const order = await OrderRepository.getByOrderId(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Check if already confirmed
      if (order.status === 'CONFIRMED') {
        logger.info('Order already confirmed (idempotent)', { orderId });
        return {
          success: true,
          data: order,
          isIdempotent: true,
        };
      }

      if (order.status !== 'PENDING') {
        return {
          success: false,
          error: `Cannot confirm order with status: ${order.status}`,
        };
      }

      const reservation = await ReservationRepository.getByReservationId(reservationId);
      if (!reservation) {
        return {
          success: false,
          error: 'Reservation not found',
        };
      }

      // Verify reservation is still valid
      if (new Date() > reservation.expiresAt) {
        return {
          success: false,
          error: 'Reservation has expired, cannot confirm checkout',
        };
      }

      // Confirm reservation in database
      await ReservationRepository.confirm(reservationId);

      // Confirm order
      const confirmedOrder = await OrderRepository.confirm(orderId);

      // Update inventory - remove from reserved count (already done in reservation)
      await InventoryRepository.confirmReservation(order.sku, order.quantity);

      logger.info('Checkout confirmed', {
        orderId,
        reservationId,
        sku: order.sku,
        quantity: order.quantity,
      });

      return {
        success: true,
        data: confirmedOrder,
      };
    } catch (error) {
      logger.error('Error confirming checkout', {
        orderId,
        reservationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Cancel checkout - mark order as cancelled and free reservation
   */
  async cancel(orderId, reservationId) {
    try {
      const order = await OrderRepository.getByOrderId(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      if (order.status === 'CANCELLED') {
        return {
          success: true,
          data: order,
          isIdempotent: true,
        };
      }

      // Cancel the order
      const cancelledOrder = await OrderRepository.updateStatus(orderId, 'CANCELLED');

      // Free up reservation
      if (reservationId) {
        const reservation = await ReservationRepository.getByReservationId(reservationId);
        if (reservation && reservation.status === 'RESERVED') {
          await InventoryRepository.decreaseReserved(reservation.sku, reservation.quantity);
          await ReservationRepository.cancel(reservationId);
        }
      }

      logger.info('Checkout cancelled', { orderId, reservationId });

      return {
        success: true,
        data: cancelledOrder,
      };
    } catch (error) {
      logger.error('Error cancelling checkout', {
        orderId,
        reservationId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    try {
      const order = await OrderRepository.getByOrderId(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('Error fetching order', { orderId, error: error.message });
      throw error;
    }
  }
}

module.exports = new CheckoutService();
