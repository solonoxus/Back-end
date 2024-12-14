const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Chưa xử lý', 'Đang xử lý', 'Đã xử lý'],
    default: 'Chưa xử lý'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema); 