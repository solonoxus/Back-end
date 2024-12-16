require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "localhost",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/sanpham",
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  // Thêm các cấu hình timeout cho database
  DB_TIMEOUT: process.env.DB_TIMEOUT || 30000,
  DB_RETRY_ATTEMPTS: process.env.DB_RETRY_ATTEMPTS || 5,
  DB_RETRY_DELAY: process.env.DB_RETRY_DELAY || 5000
};
