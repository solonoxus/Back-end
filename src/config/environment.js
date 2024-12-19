require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3001,
  HOST: process.env.HOST || 'localhost',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sanpham',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001'
};