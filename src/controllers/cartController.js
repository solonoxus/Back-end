const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { AppError } = require('../config/errorHandler');

const cartController = {
  // Lấy giỏ hàng của user
  async getCart(req, reply) {
    try {
      let cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name code price promotionPrice images stock');

      if (!cart) {
        cart = await Cart.create({ user: req.user.id });
      }

      return reply.send(cart);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi lấy giỏ hàng');
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req, reply) {
    try {
      const { productId, quantity } = req.body;

      // Kiểm tra sản phẩm
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError(404, 'Không tìm thấy sản phẩm');
      }

      if (!product.isActive) {
        throw new AppError(400, 'Sản phẩm không còn kinh doanh');
      }

      if (product.stock < quantity) {
        throw new AppError(400, `Chỉ còn ${product.stock} sản phẩm`);
      }

      // Tìm hoặc tạo giỏ hàng
      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        cart = await Cart.create({ user: req.user.id });
      }

      // Thêm sản phẩm
      await cart.addItem(productId, quantity);

      // Populate và trả về giỏ hàng
      cart = await Cart.findById(cart._id)
        .populate('items.product', 'name code price promotionPrice images stock');

      return reply.send({
        message: 'Đã thêm vào giỏ hàng',
        cart
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi thêm vào giỏ hàng');
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(req, reply) {
    try {
      const { productId, quantity } = req.body;

      // Kiểm tra số lượng
      if (quantity < 0) {
        throw new AppError(400, 'Số lượng không hợp lệ');
      }

      // Tìm giỏ hàng
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new AppError(404, 'Không tìm thấy giỏ hàng');
      }

      // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
      if (quantity === 0) {
        cart.items = cart.items.filter(item => 
          item.product.toString() !== productId
        );
      } else {
        // Kiểm tra tồn kho
        const product = await Product.findById(productId);
        if (!product) {
          throw new AppError(404, 'Không tìm thấy sản phẩm');
        }

        if (product.stock < quantity) {
          throw new AppError(400, `Chỉ còn ${product.stock} sản phẩm`);
        }

        // Cập nhật số lượng
        await cart.updateItem(productId, quantity);
      }

      await cart.save();

      // Populate và trả về giỏ hàng
      const updatedCart = await Cart.findById(cart._id)
        .populate('items.product', 'name code price promotionPrice images stock');

      return reply.send({
        message: 'Đã cập nhật giỏ hàng',
        cart: updatedCart
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi cập nhật giỏ hàng');
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(req, reply) {
    try {
      const { productId } = req.params;

      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new AppError(404, 'Không tìm thấy giỏ hàng');
      }

      // Xóa sản phẩm
      cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
      );

      await cart.save();

      // Populate và trả về giỏ hàng
      const updatedCart = await Cart.findById(cart._id)
        .populate('items.product', 'name code price promotionPrice images stock');

      return reply.send({
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        cart: updatedCart
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req, reply) {
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new AppError(404, 'Không tìm thấy giỏ hàng');
      }

      await cart.clear();

      return reply.send({
        message: 'Đã xóa toàn bộ giỏ hàng'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi xóa giỏ hàng');
    }
  },

  // Kiểm tra tồn kho của giỏ hàng
  async validateCart(req, reply) {
    try {
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        throw new AppError(404, 'Không tìm thấy giỏ hàng');
      }

      const errors = await cart.validateStock();
      if (errors.length > 0) {
        throw new AppError(400, 'Một số sản phẩm không đủ số lượng', errors);
      }

      return reply.send({
        message: 'Giỏ hàng hợp lệ'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Lỗi khi kiểm tra giỏ hàng');
    }
  }
};

module.exports = cartController;