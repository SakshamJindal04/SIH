const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://safekart_user:MySafePassword2025@safekartcluster.yiu8d5o.mongodb.net/?retryWrites=true&w=majority&appName=SafekartCluster";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // No need for useNewUrlParser or useUnifiedTopology in latest mongoose
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;