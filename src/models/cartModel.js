// src/models/cartModel.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);// src/controllers/cartController.js
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const cartController = {
  async getCart(req, reply) {
    try {
      const userId = req.user._id;
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      return reply.send({ cart: cart ? cart.items : [] });
    } catch (error) {
      console.error('Error getting cart:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy giỏ hàng' });
    }
  },

  async addToCart(req, reply) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return reply.status(404).send({ message: 'Sản phẩm không tồn tại' });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
      return reply.send({ message: 'Thêm vào giỏ thành công', cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return reply.status(500).send({ message: 'Lỗi khi thêm vào giỏ hàng' });
    }
  },

  async updateCartItem(req, reply) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return reply.status(404).send({ message: 'Không tìm thấy giỏ hàng' });
      }

      const item = cart.items.find(
        item => item.product.toString() === productId
      );

      if (!item) {
        return reply.status(404).send({ message: 'Sản phẩm không có trong giỏ' });
      }

      if (quantity === 0) {
        cart.items = cart.items.filter(
          item => item.product.toString() !== productId
        );
      } else {
        item.quantity = quantity;
      }

      await cart.save();
      return reply.send({ message: 'Cập nhật giỏ hàng thành công', cart });
    } catch (error) {
      console.error('Error updating cart:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật giỏ hàng' });
    }
  },

  async removeFromCart(req, reply) {
    try {
      const userId = req.user._id;
      const { productId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return reply.status(404).send({ message: 'Không tìm thấy giỏ hàng' });
      }

      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );

      await cart.save();
      return reply.send({ message: 'Xóa sản phẩm thành công', cart });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' });
    }
  },

  async clearCart(req, reply) {
    try {
      const userId = req.user._id;
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] },
        { new: true }
      );
      return reply.send({ message: 'Đã xóa giỏ hàng' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa giỏ hàng' });
    }
  }
};

module.exports = cartController;