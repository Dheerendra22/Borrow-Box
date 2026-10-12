const mongoose = require("mongoose");

// connectDB: opens one connection to MongoDB Atlas using the
// MONGO_URI from our .env file. Called once when the server starts.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit the process — no point running the server without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
