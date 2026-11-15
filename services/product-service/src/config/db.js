const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance for Product Service.
 * Follows the Database-per-Service pattern with product_db.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose options are set by default in v8+
    });

    console.log(`[Product Service] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Product Service] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
