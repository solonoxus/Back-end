// src/models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ code: 1 }, { unique: true });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// Virtuals
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

productSchema.virtual('currentPrice').get(function() {
  return this.promotionPrice || this.price;
});

// Methods
productSchema.methods.updateStock = async function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Số lượng tồn kho không đủ');
  }
  this.stock += quantity;
  return this.save();
};

productSchema.methods.updateRating = async function(newRating) {
  const oldTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (oldTotal + newRating) / this.rating.count;
  return this.save();
};

productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Statics
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

productSchema.statics.findByBrand = function(brand) {
  return this.find({ brand, isActive: true });
};

productSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true });
};

productSchema.statics.findPromoted = function() {
  return this.find({ 
    isActive: true, 
    isPromoted: true,
    promotionPrice: { $ne: null }
  });
};

productSchema.statics.search = function(query) {
  return this.find({
    isActive: true,
    $text: { $search: query }
  });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;