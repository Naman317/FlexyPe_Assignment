// Product Rendering Service
class ProductService {
    static async loadAndRenderProducts() {
        try {
            const data = await APIService.getInventory();

            if (!data.success) {
                NotificationService.error(data.message || 'Failed to load products');
                // Show offline message
                const container = document.getElementById('productsContainer');
                container.innerHTML = `
                    <div style="grid-column: 1/-1; color: white; text-align: center; padding: 40px;">
                        <div style="font-size: 2em; margin-bottom: 15px;">⚠️</div>
                        <p style="font-size: 1.1em; font-weight: bold; margin-bottom: 10px;">Server Connection Failed</p>
                        <p>${data.message || 'Make sure the backend server is running on port 3000'}</p>
                        <p style="margin-top: 20px; opacity: 0.8;">Retrying in 5 seconds...</p>
                    </div>
                `;
                // Retry after 5 seconds
                setTimeout(() => this.loadAndRenderProducts(), 5000);
                return;
            }

            this.renderProducts(data.data);
        } catch (error) {
            console.error('Error loading products:', error);
            NotificationService.error('Error connecting to server. Make sure backend is running on port 3000.');
        }
    }

    static renderProducts(products) {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; color: white; text-align: center; padding: 40px;">No products available</p>';
            return;
        }

        products.forEach(product => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    static createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.id = `product-${product.sku}`;

        const emoji = Utils.getProductEmoji(product.productName);
        const { statusClass, statusText, isInStock } = Utils.getInventoryStatus(product.availableQuantity);
        const reservation = AppState.getReservation(product.sku);

        let reservationHTML = '';
        if (reservation) {
            reservationHTML = this.createReservationHTML(product, reservation);
        }

        card.innerHTML = `
            <div class="product-image">${emoji}</div>
            <div class="product-info">
                <div class="product-name">${product.productName}</div>
                <div class="product-sku">SKU: ${product.sku}</div>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="inventory-status ${statusClass}">${statusText}</div>
                ${reservationHTML}
                ${!reservation ? this.createQuantityAndButtonHTML(product, isInStock) : ''}
            </div>
        `;

        return card;
    }

    static async loadReservationStatus(sku) {
        // No longer needed
    }

    static createReservationHTML(product, reservation) {
        const timeLeft = Math.max(0, Math.ceil((new Date(reservation.expiresAt) - new Date()) / 1000));
        const timeFormatted = Utils.formatTimeRemaining(timeLeft);

        return `
            <div class="reservation-info success">
                ✓ Reserved for ${reservation.quantity} item(s)
                <div class="countdown">Expires in: ${timeFormatted}</div>
                <div style="margin-top: 10px;">
                    <button class="btn-cancel" style="margin-bottom: 5px;" onclick="CheckoutController.proceedToCheckout('${product.sku}')">
                        Proceed to Checkout
                    </button>
                    <button class="btn-cancel" onclick="ReservationController.cancelReservation('${reservation.reservationId}')">
                        Release Reservation
                    </button>
                </div>
            </div>
        `;
    }

    static createQuantityAndButtonHTML(product, isInStock) {
        return `
            <div class="quantity-selector">
                <label for="qty-${product.sku}">Quantity:</label>
                <input type="number" id="qty-${product.sku}" value="1" min="1" max="${product.availableQuantity || 1}">
            </div>
            <div class="action-buttons">
                <button class="btn-reserve" ${!isInStock ? 'disabled' : ''} onclick="ReservationController.reserve('${product.sku}', '${product.productName}', ${product.price})">
                    Reserve Now
                </button>
            </div>
        `;
    }
}
