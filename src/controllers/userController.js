const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const { AppError } = require('../config/errorHandler');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

const userController = {
  // Đăng ký tài khoản
  async register(req, reply) {
    try {
      const { username, email, password, name, phone, address } = req.body;

      // Kiểm tra username và email đã tồn tại
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        throw new AppError(400, 'Username hoặc email đã được sử dụng');
      }

      // Tạo user mới
      const user = new User({
        username,
        email,
        password,
        name,
        phone,
        address
      });

      await user.save();

      // Tạo giỏ hàng cho user
      await Cart.create({ user: user._id });

      // Tạo token
      const token = jwt.sign(
        { 
          id: user._id,
          isAdmin: user.isAdmin
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      return reply.code(201).send({
        message: 'Đăng ký thành công',
        token
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi đăng ký tài khoản');
    }
  },

  // Đăng nhập
  async login(req, reply) {
    try {
      const { username, password } = req.body;

      // Tìm user và lấy cả trường password
      const user = await User.findOne({ username })
        .select('+password');

      if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, 'Username hoặc mật khẩu không đúng');
      }

      if (!user.isActive) {
        throw new AppError(401, 'Tài khoản đã bị khóa');
      }

      // Cập nhật thời gian đăng nhập
      user.lastLogin = new Date();
      await user.save();

      // Tạo token
      const token = jwt.sign(
        { 
          id: user._id,
          isAdmin: user.isAdmin
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      return reply.send({
        message: 'Đăng nhập thành công',
        token
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi đăng nhập');
    }
  },

  // Lấy thông tin user
  async getProfile(req, reply) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'Không tìm thấy người dùng');
      }
      return reply.send(user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi lấy thông tin người dùng');
    }
  },

  // Cập nhật thông tin user
  async updateProfile(req, reply) {
    try {
      const { name, phone, address } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'Không tìm thấy người dùng');
      }

      // Cập nhật thông tin
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;

      await user.save();

      return reply.send({
        message: 'Cập nhật thông tin thành công',
        user
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi cập nhật thông tin');
    }
  },

  // Đổi mật khẩu
  async changePassword(req, reply) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        throw new AppError(404, 'Không tìm thấy người dùng');
      }

      // Kiểm tra mật khẩu hiện tại
      if (!(await user.comparePassword(currentPassword))) {
        throw new AppError(401, 'Mật khẩu hiện tại không đúng');
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      await user.save();

      return reply.send({
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi đổi mật khẩu');
    }
  },

  // Quên mật khẩu
  async forgotPassword(req, reply) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError(404, 'Không tìm thấy email này');
      }

      // Tạo token reset password
      const resetToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Lưu token và thời gian hết hạn
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // TODO: Gửi email reset password

      return reply.send({
        message: 'Đã gửi email hướng dẫn reset password'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi xử lý quên mật khẩu');
    }
  },

  // Reset mật khẩu
  async resetPassword(req, reply) {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new AppError(400, 'Token không hợp lệ hoặc đã hết hạn');
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return reply.send({
        message: 'Đặt lại mật khẩu thành công'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi reset mật khẩu');
    }
  }
};

module.exports = userController;