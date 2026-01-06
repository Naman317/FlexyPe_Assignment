const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

class OrderRepository {
  
  async create(userId, reservationId, sku, quantity, totalPrice) {
    const orderId = uuidv4();
    const order = new Order({
      orderId,
      userId,
      reservationId,
      sku: sku.toUpperCase(),
      quantity,
      totalPrice,
      status: 'PENDING',
    });
    return await order.save();
  }

  
  async getByOrderId(orderId) {
    return await Order.findOne({ orderId });
  }


  async getByUserId(userId) {
    return await Order.find({ userId });
  }

  
  async getByReservationId(reservationId) {
    return await Order.findOne({ reservationId });
  }

  
  async updateStatus(orderId, status) {
    return await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    return await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus },
      { new: true }
    );
  }

  async confirm(orderId) {
    return await this.updateStatus(orderId, 'CONFIRMED');
  }

  
  async getAll() {
    return await Order.find();
  }
}

module.exports = new OrderRepository();
