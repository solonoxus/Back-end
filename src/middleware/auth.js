const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const User = require('../models/userModel');
const { AppError } = require('../config/errorHandler');

const auth = async (req, reply, next) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError(401, 'Vui lòng đăng nhập');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Tìm user với id từ token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AppError(401, 'Token không hợp lệ');
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      throw new AppError(403, 'Tài khoản đã bị khóa');
    }

    // Gán user vào request để sử dụng ở các route khác
    req.user = user;

    await next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'JsonWebTokenError') {
      throw new AppError(401, 'Token không hợp lệ');
    }
    throw new AppError(401, 'Vui lòng đăng nhập');
  }
};

module.exports = auth;