// API Service - Handles all backend communication
class APIService {
    static async getInventory() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/inventory`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching inventory:', error);
            // Return error response instead of throwing
            return {
                success: false,
                message: 'Failed to connect to server. Make sure backend is running on port 3000.'
            };
        }
    }

    static async reserveInventory(userId, sku, quantity) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/inventory/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, sku, quantity })
            });
            return await response.json();
        } catch (error) {
            console.error('Error reserving inventory:', error);
            throw error;
        }
    }

    static async cancelReservation(reservationId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/inventory/reserve/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            throw error;
        }
    }

    static async createOrder(userId, reservationId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/checkout/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reservationId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get reservation status and active reservations for a product
     * @param {string} sku - Product SKU
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    static async getReservationStatus(sku) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/reservation/status/${sku}`);
        return await response.json();
    }

    /**
     * Check if a product can be reserved with given quantity
     * @param {string} sku - Product SKU
     * @param {number} quantity - Requested quantity
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    static async checkReservationAvailability(sku, quantity) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/reservation/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, quantity }),
        });
        return await response.json();
    }

    /**
     * Confirm checkout
     * @param {string} userId - User ID
     * @param {string} orderId - Order ID
     * @param {string} reservationId - Reservation ID
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    static async confirmCheckout(userId, orderId, reservationId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/checkout/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, orderId, reservationId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error confirming checkout:', error);
            throw error;
        }
    }
}
