const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// Methods
contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

contactSchema.methods.reply = async function(message, respondedBy) {
  this.status = 'replied';
  this.response = {
    message,
    respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

contactSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

// Statics
contactSchema.statics.findUnread = function() {
  return this.find({ status: 'new' });
};

contactSchema.statics.findByEmail = function(email) {
  return this.find({ email });
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;