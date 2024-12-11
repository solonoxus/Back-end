const Product = require('../models/productsModel');

//lấy tất cả sản phẩm
exports.getAllProducts = async (req, reply) => {
  const products = await Product.find();
  reply.view('products', { title: 'Danh sách sản phẩm', products });
};

//lấy sản phẩm theo id
exports.getProductById = async (req, reply) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if(!product) {
    reply.send({ message: 'Không tìm thấy sản phẩm!' });
  }
  reply.view('productDetail', { title: product.name, product });
};

//Tạo sản phẩm mới
exports.createProduct = async (req, reply) => {
  const productData = req.body;
  const newProduct = new Product(productData);
  await newProduct.save();
  reply.send({ message: 'Tạo sản phẩm thành công!', product: newProduct });
};

//Cập nhật sản phẩm
exports.updateProduct = async (req, reply) => {
  const { id } = req.params;
  const updateData = req.body;
  const updateProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
  reply.send({ message: 'Cập nhật sản phẩm thành công!', product: updateProduct });
};

//Xóa sản phẩm
exports.deleteProduct = async (req, reply) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  reply.send({ message: 'Xóa sản phẩm thành công!' });
}