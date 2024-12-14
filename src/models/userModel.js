const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  phone: String,
  address: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  off: {
    type: Boolean,
    default: false
  },
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number
  }],
  orders: [{
    products: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      price: Number
    }],
    totalAmount: Number,
    orderDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Đang chờ xử lý', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'],
      default: 'Đang chờ xử lý'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 