
const mongoose = require("mongoose");
const { MONGODB_URI } = require("./environment");

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB đã kết nối thành công ✅");
  } catch (err) {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;