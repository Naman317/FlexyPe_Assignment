const InventoryController = require('../controllers/InventoryController');
const ReservationController = require('../controllers/ReservationController');
const CheckoutController = require('../controllers/CheckoutController');

module.exports = (app) => {
  // Inventory routes
  app.get('/inventory', InventoryController.getAllInventory.bind(InventoryController));
  app.get('/inventory/:sku', InventoryController.getInventory.bind(InventoryController));
  app.post('/inventory', InventoryController.createInventory.bind(InventoryController));

  // Reservation routes
  app.post('/inventory/reserve', ReservationController.reserve.bind(ReservationController));
  app.get('/reservation/:reservationId', ReservationController.getReservation.bind(ReservationController));
  app.get('/reservation/status/:sku', ReservationController.getReservationStatus.bind(ReservationController));
  app.post('/reservation/check-availability', ReservationController.checkReservationAvailability.bind(ReservationController));
  app.post('/inventory/reserve/cancel', ReservationController.cancel.bind(ReservationController));

  // Checkout routes
  app.post('/checkout/create', CheckoutController.createOrder.bind(CheckoutController));
  app.post('/checkout/confirm', CheckoutController.confirm.bind(CheckoutController));
  app.post('/checkout/cancel', CheckoutController.cancel.bind(CheckoutController));
  app.get('/order/:orderId', CheckoutController.getOrder.bind(CheckoutController));
};
