const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'banking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  note: String,
  cancelReason: String,
  shippingCode: String,
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtuals
orderSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    const price = item.promotionPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
});

// Middleware
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  next();
});

// Methods
orderSchema.methods.updateStatus = async function(status, note, updatedBy) {
  this.status = status;
  if (status === 'cancelled' && note) {
    this.cancelReason = note;
  }
  
  this.statusHistory.push({
    status,
    note,
    updatedBy,
    updatedAt: new Date()
  });

  return this.save();
};

orderSchema.methods.validateStock = async function() {
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

orderSchema.methods.updateStock = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    );
  }
};

orderSchema.methods.restoreStock = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;