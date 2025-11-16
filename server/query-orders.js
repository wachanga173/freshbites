// query-orders.js
// Run this script with: node query-orders.js
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function queryOrders() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  try {
    const orders = await Order.find({}).lean();
    console.log('All orders:');
    orders.forEach(order => {
      console.log({
        orderId: order.orderId,
        userId: order.userId,
        username: order.username,
        status: order.status,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        items: order.items,
        paymentMethod: order.paymentMethod
      });
    });
    console.log(`Total orders: ${orders.length}`);
  } catch (err) {
    console.error('Error querying orders:', err);
  } finally {
    await mongoose.disconnect();
  }
}

queryOrders();
