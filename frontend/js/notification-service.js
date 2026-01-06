// Notification Service - Handles all user feedback
class NotificationService {
    static showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    static success(message) {
        this.showToast(message, 'success');
    }

    static error(message) {
        this.showToast(message, 'error');
    }

    static info(message) {
        this.showToast(message, 'info');
    }
}
