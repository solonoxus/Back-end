const Product = require('../models/productsModel');

exports.getProductsList = async (req, reply) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    return reply.code(404).send({ message: 'Sản phẩm không tồn tại' });
  }
  reply.view('chitietsanpham', { title: product.name, product });
};