// Application Initialization and Main Setup
class Application {
    static async initialize() {
        // Load initial products
        await ProductService.loadAndRenderProducts();

        // Set up auto-refresh every 30 seconds
        setInterval(async () => {
            await ProductService.loadAndRenderProducts();
        }, CONFIG.REFRESH_INTERVAL);
    }
}

// Start app when page loads
window.addEventListener('load', () => {
    Application.initialize();
});
