// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000',
    RESERVATION_TTL: 5 * 60 * 1000, // 5 minutes
    REFRESH_INTERVAL: 30 * 1000, // 30 seconds
};

// Application State
const AppState = {
    currentUser: generateUserId(),
    reservations: new Map(),
    orders: new Map(),

    setReservation(sku, reservation) {
        this.reservations.set(sku, reservation);
    },

    getReservation(sku) {
        return this.reservations.get(sku);
    },

    deleteReservation(sku) {
        this.reservations.delete(sku);
    },

    setOrder(orderId, order) {
        this.orders.set(orderId, order);
    },

    getOrder(orderId) {
        return this.orders.get(orderId);
    },
};

function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}
