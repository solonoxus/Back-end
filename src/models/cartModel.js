// src/models/cartModel.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  promotionPrice: {
    type: Number,
    min: 0,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  lastModified: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'checkout', 'abandoned'],
    default: 'active'
  },
  sessionId: {
    type: String,
    sparse: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtuals
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    const price = item.promotionPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
});

// Middleware
cartSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Methods
cartSchema.methods.validateStock = async function() {
  const Product = mongoose.model('Product');
  const errors = [];

  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      errors.push(`Sản phẩm ${item.product} không tồn tại`);
      continue;
    }
    if (product.stock < item.quantity) {
      errors.push(`Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`);
    }
  }

  return errors;
};

cartSchema.methods.updatePrices = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      item.price = product.price;
      item.promotionPrice = product.promotionPrice;
    }
  }
  
  return this.save();
};

cartSchema.methods.addItem = async function(productId, quantity) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) throw new Error('Sản phẩm không tồn tại');
    
    this.items.push({
      product: productId,
      quantity,
      price: product.price,
      promotionPrice: product.promotionPrice
    });
  }

  return this.save();
};

cartSchema.methods.updateItem = async function(productId, quantity) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (!item) throw new Error('Sản phẩm không có trong giỏ hàng');

  if (quantity <= 0) {
    this.items = this.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

cartSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;