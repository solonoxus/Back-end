const Product = require('../models/Product');

exports.getCart = async (req, reply) => {
  // Lấy giỏ hàng mẫu
  const products = await Product.find({ stock: { $gt: 0 } }).limit(5);
  reply.view('giohang', { title: 'Giỏ Hàng', products });
};