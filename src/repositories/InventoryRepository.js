const Inventory = require('../models/Inventory');
const CacheService = require('../services/CacheService');

class InventoryRepository {
 
  async getBySkU(sku) {
    return await Inventory.findOne({ sku: sku.toUpperCase() });
  }

 
  async getAll() {
    return await Inventory.find();
  }

 
  async create(inventoryData) {
    const inventory = new Inventory(inventoryData);
    return await inventory.save();
  }

  
  async updateQuantities(sku, availableQuantity, reservedQuantity) {
    const skuUpper = sku.toUpperCase();
    const result = await Inventory.findOneAndUpdate(
      { sku: skuUpper },
      {
        availableQuantity,
        reservedQuantity,
      },
      { new: true }
    );
    // Invalidate cache
    await CacheService.delete(`inventory:${skuUpper}`);
    return result;
  }


  async increaseReserved(sku, quantity) {
    const skuUpper = sku.toUpperCase();
    const result = await Inventory.findOneAndUpdate(
      { sku: skuUpper },
      {
        $inc: { reservedQuantity: quantity, availableQuantity: -quantity },
      },
      { new: true }
    );
    // Invalidate cache
    await CacheService.delete(`inventory:${skuUpper}`);
    return result;
  }

 
  async decreaseReserved(sku, quantity) {
    const skuUpper = sku.toUpperCase();
    const result = await Inventory.findOneAndUpdate(
      { sku: skuUpper },
      {
        $inc: { reservedQuantity: -quantity, availableQuantity: quantity },
      },
      { new: true }
    );
    // Invalidate cache
    await CacheService.delete(`inventory:${skuUpper}`);
    return result;
  }


  async confirmReservation(sku, quantity) {
    const skuUpper = sku.toUpperCase();
    const result = await Inventory.findOneAndUpdate(
      { sku: skuUpper },
      {
        $inc: { reservedQuantity: -quantity },
      },
      { new: true }
    );
    // Invalidate cache
    await CacheService.delete(`inventory:${skuUpper}`);
    return result;
  }
}

module.exports = new InventoryRepository();
