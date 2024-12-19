// src/models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: String,
  category: String,
  image: String,
  averageRating: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date,
    updatedAt: Date
  }]
}, {
  timestamps: true
});

productSchema.index({ name: 'text' });
module.exports = mongoose.model('Product', productSchema);