const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance for User Service.
 * Follows the Database-per-Service pattern with user_db.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/user_db';
    const conn = await mongoose.connect(mongoUri);

    console.log(`[User Service] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[User Service] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
