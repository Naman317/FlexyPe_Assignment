// Modal Service - Handles checkout modal interactions
class ModalService {
    static showCheckoutModal(order, reservation) {
        const modal = document.getElementById('checkoutModal');
        const details = document.getElementById('checkoutDetails');
        const totalPrice = order.totalPrice.toFixed(2);

        details.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <p><strong>Product:</strong> ${reservation.productName}</p>
                <p><strong>Quantity:</strong> ${reservation.quantity}</p>
                <p><strong>Unit Price:</strong> ₹${reservation.price.toFixed(2)}</p>
                <p style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                    <strong style="font-size: 1.2em;">Total: ₹${totalPrice}</strong>
                </p>
            </div>
            <div style="color: #666; font-size: 0.9em;">
                Click "Confirm" to complete your purchase. Your reservation expires in 5 minutes.
            </div>
        `;

        // Set up confirm button
        const confirmBtn = document.getElementById('confirmCheckoutBtn');
        confirmBtn.onclick = () => {
            CheckoutController.confirmCheckout(order.orderId, reservation.reservationId);
        };

        // Show modal
        modal.classList.add('active');
    }

    static closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        modal.classList.remove('active');
    }
}
