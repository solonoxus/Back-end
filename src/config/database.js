const mongoose = require("mongoose");
const { MONGODB_URI } = require("./environment");

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB đã được kết nối ✅");
      return;
    }

    console.log("Đang kết nối đến MongoDB...");
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    console.log("MongoDB đã kết nối thành công ✅");
    retryCount = 0;
  } catch (err) {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Đang thử kết nối lại... Lần ${retryCount}/${MAX_RETRIES}`);
      setTimeout(connectDatabase, 5000);
    } else {
      console.error("Đã vượt quá số lần thử kết nối. Thoát ứng dụng.");
      process.exit(1);
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  if (mongoose.connection.readyState !== 1) {
    connectDatabase();
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bị ngắt kết nối. Đang thử kết nối lại...');
  connectDatabase();
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi đóng kết nối MongoDB:', err);
    process.exit(1);
  }
});

module.exports = connectDatabase;