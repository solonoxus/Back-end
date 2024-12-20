const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Contact = require('../models/contactModel');
const { Errors } = require('../config/errorHandler');
const cache = require('../config/cache');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

// Tạo JWT token
const createToken = (adminId) => {
  return jwt.sign({ id: adminId, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
};

const adminController = {
  // Đăng nhập admin
  async login(req, reply) {
    try {
      const { username, password } = req.body;

      // Kiểm tra user có quyền admin
      const admin = await User.findOne({ username, isAdmin: true })
        .select('+password');

      if (!admin) {
        return reply.status(401).send({ message: 'Thông tin đăng nhập không chính xác' });
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return reply.status(401).send({ message: 'Thông tin đăng nhập không chính xác' });
      }

      // Tạo token với isAdmin
      const token = jwt.sign(
        { id: admin._id, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return reply.send({ token });
    } catch (error) {
      console.error('Error in admin login:', error);
      return reply.status(500).send({ message: 'Lỗi khi đăng nhập' });
    }
  },

  // Thống kê tổng quan
  async getDashboard(req, reply) {
    try {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        recentOrders,
        orderStats
      ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email'),
        Order.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

      return reply.send({
        summary: {
          totalUsers,
          totalProducts,
          totalOrders
        },
        recentOrders,
        orderStats
      });
    } catch (error) {
      console.error('Error getting dashboard:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy thống kê' });
    }
  },

  // Quản lý người dùng
  async getUsers(req, reply) {
    try {
      const { search, sort = 'createdAt', page = 1, limit = 10 } = req.query;

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      return reply.send({
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
  },

  async updateUser(req, reply) {
    try {
      const updates = req.body;
      delete updates.password; // Không cho phép admin đổi mật khẩu user

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      ).select('-password');

      if (!user) {
        return reply.status(404).send({ message: 'Không tìm thấy người dùng' });
      }

      return reply.send(user);
    } catch (error) {
      console.error('Error updating user:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật người dùng' });
    }
  },

  async deleteUser(req, reply) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return reply.status(404).send({ message: 'Không tìm thấy người dùng' });
      }

      return reply.send({ message: 'Đã xóa người dùng' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa người dùng' });
    }
  },

  // Quản lý đơn hàng
  async getOrders(req, reply) {
    try {
      const { status, search, sort = 'createdAt', page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('user', 'name email')
          .populate('products.product')
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(query)
      ]);

      return reply.send({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách đơn hàng' });
    }
  },

  async updateOrder(req, reply) {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('user products.product');

      if (!order) {
        return reply.status(404).send({ message: 'Không tìm thấy đơn hàng' });
      }

      return reply.send(order);
    } catch (error) {
      console.error('Error updating order:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật đơn hàng' });
    }
  },

  // Quản lý sản phẩm
  async getProducts(req, reply) {
    try {
      const { search, category, sort = 'createdAt', page = 1, limit = 10 } = req.query;

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }
      if (category) query.category = category;

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(query)
      ]);

      return reply.send({
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting products:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
  },

  async createProduct(req, reply) {
    try {
      const product = new Product(req.body);
      await product.save();

      return reply.code(201).send(product);
    } catch (error) {
      console.error('Error creating product:', error);
      return reply.status(500).send({ message: 'Lỗi khi tạo sản phẩm' });
    }
  },

  async updateProduct(req, reply) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }

      return reply.send(product);
    } catch (error) {
      console.error('Error updating product:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
  },

  async deleteProduct(req, reply) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }

      return reply.send({ message: 'Đã xóa sản phẩm' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa sản phẩm' });
    }
  },

  // Xác thực token admin
  async verifyToken(req, reply) {
    try {
      const admin = await Admin.findById(req.user._id);
      if (!admin || !admin.isAdmin) {
        throw Errors.Unauthorized('Token không hợp lệ');
      }

      return reply.send({
        success: true,
        message: 'Token hợp lệ'
      });
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách users
  async getUsers(req, reply) {
    try {
      const { search, sort = 'createdAt', page = 1, limit = 10 } = req.query;
      const cacheKey = `users:${search || 'all'}:${sort}:${page}:${limit}`;

      // Kiểm tra cache
      let result = await cache.get(cacheKey);
      if (result) {
        logger.info(`Cache hit for ${cacheKey}`);
        return reply.send(result);
      }

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      result = {
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      };

      // Cache kết quả trong 5 phút
      await cache.set(cacheKey, result, 300);
      logger.info(`Cached users list`);

      return reply.send(result);
    } catch (error) {
      logger.error('Error in getUsers:', error);
      throw error;
    }
  },

  async toggleUserStatus(req, reply) {
    try {
      const { userId, isLocked } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { isLocked },
        { new: true }
      ).select('-password');

      if (!user) {
        throw Errors.NotFound('Không tìm thấy người dùng');
      }

      return reply.send({
        success: true,
        data: user
      });
    } catch (error) {
      throw error;
    }
  },

  async getOrders(req, reply) {
    try {
      const orders = await Order.find()
        .populate('user', 'name email phone')
        .populate('products.product', 'name price code')
        .sort({ createdAt: -1 });

      return reply.send({
        success: true,
        data: orders
      });
    } catch (error) {
      throw error;
    }
  },

  async updateOrderStatus(req, reply) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      )
      .populate('user', 'name email phone')
      .populate('products.product', 'name price code');

      if (!order) {
        throw Errors.NotFound('Không tìm thấy đơn hàng');
      }

      return reply.send({
        success: true,
        data: order
      });
    } catch (error) {
      throw error;
    }
  },

  async getProducts(req, reply) {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 });

      return reply.send({
        success: true,
        data: products
      });
    } catch (error) {
      throw error;
    }
  },

  async createProduct(req, reply) {
    try {
      const product = await Product.create(req.body);

      return reply.code(201).send({
        success: true,
        data: product
      });
    } catch (error) {
      throw error;
    }
  },

  async updateProduct(req, reply) {
    try {
      const { productId } = req.params;

      const product = await Product.findByIdAndUpdate(
        productId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!product) {
        throw Errors.NotFound('Không tìm thấy sản phẩm');
      }

      return reply.send({
        success: true,
        data: product
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(req, reply) {
    try {
      const { productId } = req.params;

      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw Errors.NotFound('Không tìm thấy sản phẩm');
      }

      return reply.send({
        success: true,
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      throw error;
    }
  },

  // Health check endpoint
  async healthCheck(req, reply) {
    try {
      await Promise.all([
        Admin.findOne().limit(1),
        User.findOne().limit(1),
        Order.findOne().limit(1),
        Product.findOne().limit(1)
      ]);

      return reply.send({
        success: true,
        message: 'Admin service is healthy',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }
};

module.exports = adminController;