require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Database connected for seeding');
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    process.exit(1);
  }
};

const seedInventory = async () => {
  try {
    // Clear existing inventory
    await Inventory.deleteMany({});
    logger.info('Cleared existing inventory');

    // Sample products for the flash sale
    const products = [
      {
        sku: 'LAPTOP001',
        productName: 'Premium Laptop Pro',
        totalQuantity: 5,
        availableQuantity: 5,
        price: 1299.99,
      },
      {
        sku: 'PHONE001',
        productName: 'Flagship Smartphone X',
        totalQuantity: 10,
        availableQuantity: 10,
        price: 899.99,
      },
      {
        sku: 'HEADSET001',
        productName: 'Wireless Headphones Pro',
        totalQuantity: 20,
        availableQuantity: 20,
        price: 299.99,
      },
      {
        sku: 'TABLET001',
        productName: 'Ultra Tablet Max',
        totalQuantity: 8,
        availableQuantity: 8,
        price: 699.99,
      },
      {
        sku: 'WATCH001',
        productName: 'Smart Watch Elite',
        totalQuantity: 15,
        availableQuantity: 15,
        price: 399.99,
      },
      {
        sku: 'CAMERA001',
        productName: '4K Mirrorless Camera',
        totalQuantity: 3,
        availableQuantity: 3,
        price: 1599.99,
      },
      {
        sku: 'SPEAKER001',
        productName: 'Portable Bluetooth Speaker',
        totalQuantity: 25,
        availableQuantity: 25,
        price: 149.99,
      },
      {
        sku: 'CHARGER001',
        productName: 'Fast Charging Station',
        totalQuantity: 30,
        availableQuantity: 30,
        price: 79.99,
      },
    ];

    const result = await Inventory.insertMany(products);
    logger.info(`Seeded ${result.length} products`, {
      products: result.map((p) => p.sku),
    });

    console.log('\n✅ Inventory seeded successfully!');
    console.log('\nAvailable Products:');
    console.log('====================');
    result.forEach((product) => {
      console.log(`SKU: ${product.sku}`);
      console.log(`  Product: ${product.productName}`);
      console.log(`  Price: $${product.price}`);
      console.log(`  Stock: ${product.availableQuantity} units\n`);
    });
  } catch (error) {
    logger.error('Error seeding inventory', { error: error.message });
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

connectDB().then(() => seedInventory());
