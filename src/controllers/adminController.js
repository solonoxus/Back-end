const User = require('../models/userModel');
const Product = require('../models/productModel');

const adminController = {
  // Đăng nhập admin
  async login(req, reply) {
    try {
      const { username, password } = req.body;
      
      // Kiểm tra thông tin admin (có thể lưu trong env hoặc database)
      if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        return reply.code(401).send({
          success: false,
          message: 'Thông tin đăng nhập không đúng'
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          username,
          isAdmin: true
        }
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy danh sách người dùng
  async getUsers(req, reply) {
    try {
      const users = await User.find().select('-password');
      return reply.code(200).send({
        success: true,
        data: users
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Khóa/mở khóa tài khoản người dùng
  async toggleUserStatus(req, reply) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { isLocked: status },
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

  // Thêm sản phẩm mới
  async addProduct(req, reply) {
    try {
      const product = await Product.create(req.body);
      return reply.code(201).send({
        success: true,
        data: product
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(req, reply) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      if (!product) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Xóa sản phẩm
  async deleteProduct(req, reply) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      return reply.code(200).send({
        success: true,
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = adminController;