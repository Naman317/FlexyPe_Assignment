const Reservation = require('../models/Reservation');
const { v4: uuidv4 } = require('uuid');

class ReservationRepository {
  
  async create(userId, sku, quantity, expiresAt) {
    const reservationId = uuidv4();
    const reservation = new Reservation({
      reservationId,
      userId,
      sku: sku.toUpperCase(),
      quantity,
      expiresAt,
      status: 'RESERVED',
    });
    return await reservation.save();
  }

  async getByReservationId(reservationId) {
    return await Reservation.findOne({ reservationId });
  }

  
  async getActiveByUserId(userId) {
    return await Reservation.find({
      userId,
      status: { $in: ['RESERVED', 'CONFIRMED'] },
    });
  }

 
  async getBySkUAndUserId(sku, userId) {
    return await Reservation.findOne({
      sku: sku.toUpperCase(),
      userId,
      status: 'RESERVED',
    });
  }

  async getActiveBySku(sku) {
    return await Reservation.find({
      sku: sku.toUpperCase(),
      status: 'RESERVED',
    });
  }

  async getExpired(beforeTime = new Date()) {
    return await Reservation.find({
      status: 'RESERVED',
      expiresAt: { $lt: beforeTime },
    });
  }

  async updateStatus(reservationId, status, confirmedAt = null) {
    const updateData = { status };
    if (confirmedAt) {
      updateData.confirmedAt = confirmedAt;
    }
    return await Reservation.findOneAndUpdate(
      { reservationId },
      updateData,
      { new: true }
    );
  }

  
  async cancel(reservationId) {
    return await this.updateStatus(reservationId, 'CANCELLED');
  }

 
  async confirm(reservationId) {
    return await this.updateStatus(reservationId, 'CONFIRMED', new Date());
  }

  async deleteExpired() {
    return await Reservation.deleteMany({
      expiresAt: { $lt: new Date() },
      status: 'RESERVED',
    });
  }

  
  async getAll() {
    return await Reservation.find();
  }
}

module.exports = new ReservationRepository();
