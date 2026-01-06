

const validateSkU = (sku) => {
  if (!sku || typeof sku !== 'string' || sku.trim() === '') {
    return { valid: false, error: 'Invalid SKU provided' };
  }
  return { valid: true };
};

const validateQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { valid: false, error: 'Quantity must be a positive integer' };
  }
  return { valid: true };
};

const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return { valid: false, error: 'Invalid user ID' };
  }
  return { valid: true };
};

const validateReservationId = (reservationId) => {
  if (!reservationId || typeof reservationId !== 'string' || reservationId.trim() === '') {
    return { valid: false, error: 'Invalid reservation ID' };
  }
  return { valid: true };
};

module.exports = {
  validateSkU,
  validateQuantity,
  validateUserId,
  validateReservationId,
};
