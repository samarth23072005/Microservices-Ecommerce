const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance for Order Service.
 * Follows the Database-per-Service pattern with order_db.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/order_db';
    const conn = await mongoose.connect(mongoUri);

    console.log(`[Order Service] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Order Service] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
