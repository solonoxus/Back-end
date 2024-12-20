const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { AppError } = require('../config/errorHandler');
const cache = require('../config/cache');
const logger = require('../config/logger');

const VALID_STATUSES = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

const orderController = {
  // Lấy danh sách đơn hàng của user
  async getOrders(req, reply) {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate('items.product')
        .sort({ createdAt: -1 });
      return reply.send(orders);
    } catch (error) {
      logger.error('Error getting orders:', error);
      throw new AppError(500, 'Lỗi khi lấy danh sách đơn hàng');
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrder(req, reply) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
      }).populate('items.product');

      if (!order) {
        throw new AppError(404, 'Không tìm thấy đơn hàng');
      }

      return reply.send(order);
    } catch (error) {
      logger.error('Error getting order:', error);
      throw new AppError(500, 'Lỗi khi lấy thông tin đơn hàng');
    }
  },

  // Tạo đơn hàng mới
  async createOrder(req, reply) {
    try {
      const { shippingAddress, paymentMethod, note } = req.body;

      // Lấy giỏ hàng hiện tại
      const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product');

      if (!cart || cart.items.length === 0) {
        throw new AppError(400, 'Giỏ hàng trống');
      }

      // Kiểm tra tồn kho
      const errors = await cart.validateStock();
      if (errors.length > 0) {
        throw new AppError(400, 'Một số sản phẩm không đủ số lượng', errors);
      }

      // Tạo đơn hàng
      const order = new Order({
        user: req.user._id,
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          promotionPrice: item.product.promotionPrice
        })),
        shippingAddress,
        paymentMethod,
        note
      });

      // Lưu đơn hàng
      await order.save();

      // Cập nhật tồn kho
      await order.updateStock();

      // Xóa giỏ hàng
      await cart.clear();

      // Populate và trả về đơn hàng
      const populatedOrder = await Order.findById(order._id)
        .populate('items.product', 'name code price promotionPrice images');

      return reply.code(201).send({
        message: 'Đặt hàng thành công',
        order: populatedOrder
      });
    } catch (error) {
      logger.error('Error creating order:', error);
      throw new AppError(500, 'Lỗi khi tạo đơn hàng');
    }
  },

  // Hủy đơn hàng
  async cancelOrder(req, reply) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!order) {
        throw new AppError(404, 'Không tìm thấy đơn hàng');
      }

      if (order.status !== 'pending') {
        throw new AppError(400, 'Không thể hủy đơn hàng này');
      }

      // Cập nhật trạng thái
      await order.updateStatus('cancelled', req.body.reason, req.user._id);

      // Hoàn lại tồn kho
      await order.restoreStock();

      return reply.send({
        message: 'Đã hủy đơn hàng'
      });
    } catch (error) {
      logger.error('Error canceling order:', error);
      throw new AppError(500, 'Lỗi khi hủy đơn hàng');
    }
  },

  // Lấy thống kê đơn hàng theo trạng thái
  async getOrderStats(req, reply) {
    try {
      const cacheKey = `orderStats:${req.user._id}`;
      
      // Kiểm tra cache
      let stats = await cache.get(cacheKey);
      if (stats) {
        logger.info(`Cache hit for order stats`);
        return reply.send({
          success: true,
          data: stats
        });
      }

      stats = await Order.aggregate([
        {
          $match: { user: req.user._id }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      // Cache kết quả trong 5 phút
      await cache.set(cacheKey, stats, 300);
      logger.info(`Cached order stats`);

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getOrderStats:', error);
      throw new AppError(500, 'Lỗi khi lấy thống kê đơn hàng');
    }
  },

  // Admin: Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, reply) {
    try {
      const { status, note } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) {
        throw new AppError(404, 'Không tìm thấy đơn hàng');
      }

      // Kiểm tra trạng thái hợp lệ
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['shipping', 'cancelled'],
        shipping: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      if (!validTransitions[order.status].includes(status)) {
        throw new AppError(400, 'Trạng thái không hợp lệ');
      }

      // Cập nhật trạng thái
      await order.updateStatus(status, note, req.user._id);

      // Nếu hủy đơn, hoàn lại tồn kho
      if (status === 'cancelled') {
        await order.restoreStock();
      }

      return reply.send({
        message: 'Đã cập nhật trạng thái đơn hàng'
      });
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw new AppError(500, 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  },

  // Admin: Lấy danh sách đơn hàng
  async getAllOrders(req, reply) {
    try {
      const { 
        status, 
        fromDate,
        toDate,
        search,
        page = 1, 
        limit = 10 
      } = req.query;

      const skip = (page - 1) * limit;

      // Query conditions
      const conditions = {};
      if (status) conditions.status = status;
      if (fromDate || toDate) {
        conditions.createdAt = {};
        if (fromDate) conditions.createdAt.$gte = new Date(fromDate);
        if (toDate) conditions.createdAt.$lte = new Date(toDate);
      }
      if (search) {
        conditions.$or = [
          { 'items.product.name': { $regex: search, $options: 'i' } },
          { shippingAddress: { $regex: search, $options: 'i' } }
        ];
      }

      // Lấy đơn hàng và tổng số
      const [orders, total] = await Promise.all([
        Order.find(conditions)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email phone')
          .populate('items.product', 'name code price promotionPrice images'),
        Order.countDocuments(conditions)
      ]);

      return reply.send({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error getting all orders:', error);
      throw new AppError(500, 'Lỗi khi lấy danh sách đơn hàng');
    }
  },

  // Health check endpoint
  async healthCheck(req, reply) {
    try {
      await Order.findOne().limit(1);
      return reply.send({
        success: true,
        message: 'Order service is healthy',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      throw new AppError(500, 'Lỗi khi kiểm tra sức khỏe dịch vụ');
    }
  }
};

module.exports = orderController;