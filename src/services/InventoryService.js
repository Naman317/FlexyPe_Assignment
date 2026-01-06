const InventoryRepository = require('../repositories/InventoryRepository');
const ReservationRepository = require('../repositories/ReservationRepository');
const { RESERVATION_CONFIG, ERROR_MESSAGES } = require('../config/constants');
const logger = require('../utils/logger');

class InventoryService {
  /**
   * Get inventory by SKU
   */
  async getInventoryBySku(sku) {
    try {
      const inventory = await InventoryRepository.getBySkU(sku);
      if (!inventory) {
        return {
          success: false,
          error: 'Product not found',
          data: null,
        };
      }
      return {
        success: true,
        data: inventory,
      };
    } catch (error) {
      logger.error('Error fetching inventory', { sku, error: error.message });
      throw error;
    }
  }

  /**
   * Get all inventory
   */
  async getAllInventory() {
    try {
      const inventory = await InventoryRepository.getAll();
      return {
        success: true,
        data: inventory,
      };
    } catch (error) {
      logger.error('Error fetching all inventory', { error: error.message });
      throw error;
    }
  }

  /**
   * Create new product inventory
   */
  async createInventory(sku, productName, quantity, price) {
    try {
      const existingInventory = await InventoryRepository.getBySkU(sku);
      if (existingInventory) {
        return {
          success: false,
          error: 'Product already exists',
          data: null,
        };
      }

      const inventory = await InventoryRepository.create({
        sku: sku.toUpperCase(),
        productName,
        totalQuantity: quantity,
        availableQuantity: quantity,
        reservedQuantity: 0,
        price,
      });

      logger.info('Inventory created', { sku, quantity });
      return {
        success: true,
        data: inventory,
      };
    } catch (error) {
      logger.error('Error creating inventory', { sku, error: error.message });
      throw error;
    }
  }

  /**
   * Check if enough inventory is available
   */
  async checkAvailability(sku, quantity) {
    try {
      const inventory = await InventoryRepository.getBySkU(sku);
      if (!inventory) {
        return {
          available: false,
          reason: 'Product not found',
        };
      }

      if (inventory.availableQuantity < quantity) {
        return {
          available: false,
          reason: ERROR_MESSAGES.INSUFFICIENT_INVENTORY,
          availableQuantity: inventory.availableQuantity,
        };
      }

      return {
        available: true,
        availableQuantity: inventory.availableQuantity,
      };
    } catch (error) {
      logger.error('Error checking availability', { sku, quantity, error: error.message });
      throw error;
    }
  }
}

module.exports = new InventoryService();
