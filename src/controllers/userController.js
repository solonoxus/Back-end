const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

// Tạo JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

const userController = {
  // Đăng ký
  async register(req, reply) {
    try {
      const { username, password, email, name, phone, address } = req.body;
      
      const user = await User.create({
        username,
        password,
        email,
        name,
        phone,
        address
      });

      const token = createToken(user._id);
      
      return reply.code(201).send({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
          },
          token
        }
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Đăng nhập
  async login(req, reply) {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ username });
      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'Tài khoản không tồn tại'
        });
      }

      const isMatch = await user.checkPassword(password);
      if (!isMatch) {
        return reply.code(401).send({
          success: false,
          message: 'Mật khẩu không đúng'
        });
      }

      const token = createToken(user._id);
      
      return reply.code(200).send({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
          },
          token
        }
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy thông tin user
  async getCurrentUser(req, reply) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      return reply.code(200).send({
        success: true,
        data: user
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Cập nhật thông tin user
  async updateUser(req, reply) {
    try {
      const { name, email, phone, address } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, email, phone, address },
        { new: true }
      ).select('-password');

      return reply.code(200).send({
        success: true,
        data: user
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req, reply) {
    try {
      const { productId, quantity } = req.body;
      const user = await User.findById(req.user.id);

      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const cartItemIndex = user.cart.findIndex(
        item => item.product.toString() === productId
      );

      if (cartItemIndex > -1) {
        // Nếu có rồi thì cập nhật số lượng
        user.cart[cartItemIndex].quantity += quantity;
      } else {
        // Nếu chưa có thì thêm mới
        user.cart.push({ product: productId, quantity });
      }

      await user.save();

      return reply.code(200).send({
        success: true,
        message: 'Thêm vào giỏ hàng thành công',
        data: user.cart
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy giỏ hàng của user
  async getCart(req, reply) {
    try {
      const user = await User.findById(req.user.id)
        .populate('cart.product');

      return reply.code(200).send({
        success: true,
        data: user.cart
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = userController;