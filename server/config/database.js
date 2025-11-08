const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection options for production
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Minimum connections in pool
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Retry failed writes
  w: 'majority', // Write concern - wait for majority acknowledgment
  connectTimeoutMS: 10000, // Timeout for initial connection
  heartbeatFrequencyMS: 10000 // How often to check server status
};

const connectDB = async () => {
  try {
    // Mongoose connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Mongoose connection closed through app termination');
      process.exit(0);
    });

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
