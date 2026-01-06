const InventoryService = require('../services/InventoryService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { validateSkU, validateQuantity } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

class InventoryController {
  /**
   * GET /inventory/{sku}
   * Get inventory details by SKU
   */
  async getInventory(req, res) {
    try {
      const { sku } = req.params;

      const validation = validateSkU(sku);
      if (!validation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
      }

      const result = await InventoryService.getInventoryBySku(sku);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, result.error);
      }

      return sendSuccess(res, HTTP_STATUS.SUCCESS, result.data);
    } catch (error) {
      logger.error('Error in getInventory controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * GET /inventory
   * Get all inventory
   */
  async getAllInventory(req, res) {
    try {
      const result = await InventoryService.getAllInventory();
      return sendSuccess(res, HTTP_STATUS.SUCCESS, result.data);
    } catch (error) {
      logger.error('Error in getAllInventory controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }

  /**
   * POST /inventory
   * Create new inventory
   */
  async createInventory(req, res) {
    try {
      const { sku, productName, quantity, price } = req.body;

      // Validation
      const skuValidation = validateSkU(sku);
      if (!skuValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, skuValidation.error);
      }

      const quantityValidation = validateQuantity(quantity);
      if (!quantityValidation.valid) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, quantityValidation.error);
      }

      if (!productName || typeof productName !== 'string') {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Product name is required');
      }

      if (!price || typeof price !== 'number' || price <= 0) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Price must be a positive number');
      }

      const result = await InventoryService.createInventory(sku, productName, quantity, price);
      if (!result.success) {
        return sendError(res, HTTP_STATUS.CONFLICT, result.error);
      }

      return sendSuccess(res, HTTP_STATUS.CREATED, result.data, 'Inventory created successfully');
    } catch (error) {
      logger.error('Error in createInventory controller', { error: error.message });
      return sendError(res, HTTP_STATUS.SERVER_ERROR, 'Internal server error');
    }
  }
}

module.exports = new InventoryController();
