// Reservation Controller - Handles reservation operations
class ReservationController {
    static async reserve(sku, productName, price) {
        const quantityInput = document.getElementById(`qty-${sku}`);
        const quantity = parseInt(quantityInput.value);

        if (!Utils.isValidQuantity(quantity)) {
            NotificationService.error('Please select a valid quantity');
            return;
        }

        // Check availability before reserving
        try {
            const availabilityCheck = await APIService.checkReservationAvailability(sku, quantity);
            if (!availabilityCheck.success || !availabilityCheck.data.canReserve) {
                NotificationService.error(`Cannot reserve: ${availabilityCheck.data.reason || 'Product unavailable'}`);
                return;
            }
        } catch (error) {
            NotificationService.error('Failed to check availability');
            return;
        }

        try {
            const data = await APIService.reserveInventory(AppState.currentUser, sku, quantity);

            if (data.success) {
                // Store reservation in app state
                AppState.setReservation(sku, {
                    reservationId: data.data.reservationId,
                    quantity: quantity,
                    expiresAt: new Date(Date.now() + data.data.expiresIn),
                    productName: productName,
                    price: price,
                    sku: sku
                });

                NotificationService.success(`✓ Reserved ${quantity} ${productName}(s) for 5 minutes!`);
                await ProductService.loadAndRenderProducts();
                this.startReservationCountdown(sku);
            } else {
                NotificationService.error(`Failed to reserve: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error reserving:', error);
            NotificationService.error('Error reserving product');
        }
    }

    static async cancelReservation(reservationId) {
        try {
            const data = await APIService.cancelReservation(reservationId);

            if (data.success) {
                // Remove from app state
                for (let [sku, reservation] of AppState.reservations.entries()) {
                    if (reservation.reservationId === reservationId) {
                        AppState.deleteReservation(sku);
                        break;
                    }
                }

                NotificationService.info('Reservation cancelled');
                await ProductService.loadAndRenderProducts();
            } else {
                NotificationService.error('Failed to cancel reservation');
            }
        } catch (error) {
            console.error('Error cancelling:', error);
            NotificationService.error('Error cancelling reservation');
        }
    }

    static startReservationCountdown(sku) {
        const interval = setInterval(async () => {
            const reservation = AppState.getReservation(sku);
            
            if (!reservation) {
                clearInterval(interval);
                return;
            }

            const timeLeft = Math.max(0, Math.ceil((new Date(reservation.expiresAt) - new Date()) / 1000));

            if (timeLeft <= 0) {
                AppState.deleteReservation(sku);
                NotificationService.info(`Reservation for ${reservation.productName} has expired`);
                await ProductService.loadAndRenderProducts();
                clearInterval(interval);
            } else {
                // Refresh UI every second to update countdown
                await ProductService.loadAndRenderProducts();
            }
        }, 1000);
    }
}
