const Inventory = require('../models/Inventory');

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
    return await Inventory.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      {
        availableQuantity,
        reservedQuantity,
      },
      { new: true }
    );
  }


  async increaseReserved(sku, quantity) {
    return await Inventory.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      {
        $inc: { reservedQuantity: quantity, availableQuantity: -quantity },
      },
      { new: true }
    );
  }

 
  async decreaseReserved(sku, quantity) {
    return await Inventory.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      {
        $inc: { reservedQuantity: -quantity, availableQuantity: quantity },
      },
      { new: true }
    );
  }


  async confirmReservation(sku, quantity) {
    return await Inventory.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      {
        $inc: { reservedQuantity: -quantity },
      },
      { new: true }
    );
  }
}

module.exports = new InventoryRepository();
