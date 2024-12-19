const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const User = require('../models/userModel');

const auth = async (req, reply) => {
  try {
    // Lấy token từ header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Tìm user với id từ token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }

    // Gán user vào request để sử dụng ở các route khác
    req.user = user;
  } catch (error) {
    reply.code(401).send({
      success: false,
      message: 'Vui lòng đăng nhập'
    });
  }
};

module.exports = auth;