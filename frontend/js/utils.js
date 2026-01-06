// Utility Functions
class Utils {
    // Format time remaining in human-readable format
    static formatTimeRemaining(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0) {
            return `${minutes}min ${seconds}sec`;
        }
        return `${seconds}sec`;
    }

    // Get emoji for product name
    static getProductEmoji(productName) {
        const emojis = {
            'Laptop': '💻',
            'Phone': '📱',
            'Tablet': '📱',
            'Headphones': '🎧',
            'Smart Watch': '⌚',
            'Camera': '📷',
            'Speaker': '🔊',
            'Monitor': '🖥️'
        };
        return emojis[productName] || '📦';
    }

    // Validate quantity input
    static isValidQuantity(quantity) {
        return Number.isInteger(quantity) && quantity > 0;
    }

    // Get inventory status info
    static getInventoryStatus(availableQuantity) {
        const isInStock = availableQuantity > 0;
        const isLowStock = availableQuantity > 0 && availableQuantity <= 3;

        let statusClass = 'out-of-stock';
        let statusText = 'Out of Stock';

        if (isInStock) {
            statusClass = isLowStock ? 'low-stock' : 'in-stock';
            statusText = isLowStock 
                ? `⚠️ Only ${availableQuantity} left!` 
                : `✓ ${availableQuantity} in stock`;
        }

        return { statusClass, statusText, isInStock };
    }
}
