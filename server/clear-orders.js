const mongoose = require('mongoose');
const Order = require('./models/Order');

// Use environment variable or default connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria';

async function clearOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Order.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} orders`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

clearOrders();
