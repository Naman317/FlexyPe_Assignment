// Checkout Controller - Handles checkout operations
class CheckoutController {
    static async proceedToCheckout(sku) {
        const reservation = AppState.getReservation(sku);
        
        if (!reservation) {
            NotificationService.error('Reservation not found');
            return;
        }

        try {
            const data = await APIService.createOrder(AppState.currentUser, reservation.reservationId);

            if (data.success) {
                const order = data.data;
                AppState.setOrder(order.orderId, {
                    orderId: order.orderId,
                    reservationId: reservation.reservationId,
                    sku: sku
                });

                ModalService.showCheckoutModal(order, reservation);
            } else {
                NotificationService.error(`Order failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            NotificationService.error('Error creating order');
        }
    }

    static async confirmCheckout(orderId, reservationId) {
        try {
            const data = await APIService.confirmCheckout(AppState.currentUser, orderId, reservationId);

            if (data.success) {
                NotificationService.success('✓ Purchase completed successfully!');
                ModalService.closeCheckoutModal();

                // Clean up from app state
                for (let [sku, reservation] of AppState.reservations.entries()) {
                    if (reservation.reservationId === reservationId) {
                        AppState.deleteReservation(sku);
                        break;
                    }
                }

                await ProductService.loadAndRenderProducts();
            } else {
                NotificationService.error(`Checkout failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error confirming checkout:', error);
            NotificationService.error('Error confirming checkout');
        }
    }
}
