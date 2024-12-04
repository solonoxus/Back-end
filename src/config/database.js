const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  try {
    const conn=await mongoose.connect("mongodb://localhost:27017/sell", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB Connection Failed ❌", err);
    process.exit(1);
  }
};

module.exports = connectDB;
