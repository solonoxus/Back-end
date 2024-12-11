const mongoose = require("mongoose");
const { MONGO_URI } = require("./environment");

// Kết nối tới MongoDB
const connectDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("MONGO_URI: ", MONGO_URI); // Sử dụng từ environment.js

    await mongoose.connect(MONGO_URI, );

    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB Connection Failed ❌", err);
    process.exit(1);
  }
};

module.exports = connectDatabase;
