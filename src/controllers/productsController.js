//Phương thức	API Endpoint	Hành động
//GET	    /api/products	      Lấy danh sách sản phẩm
//GET	    /api/products/:id	  Lấy sản phẩm theo ID
//POST	  /api/products	      Tạo sản phẩm mới
//PUT	    /api/products/:id	  Cập nhật sản phẩm
//DELETE	/api/products/:id	  Xóa sản phẩm

const Product = require("../models/productsModel");

//lấy tất cả sản phẩm
exports.getAllProducts = async (req, reply) => {
  try {
    const products = await Product.find();
    reply.view("products", { title: "Danh sách sản phẩm", products });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi lấy sản phẩm!", error: err });
  }
};

//lấy sản phẩm theo id
exports.getProductById = async (req, reply) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return reply.status(404).send({ message: "Không tìm thấy sản phẩm!" });
    }
    reply.view("productDetail", { title: product.name, product });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi tìm sản phẩm!", error: err });
  }
};

//Tạo sản phẩm mới
exports.createProduct = async (req, reply) => {
  try {
    const { name, company, price } = req.body;
    if (!name || !company || !price) {
      return reply.status(400).send({ message: "Thiếu thông tin sản phẩm!" });
    }
    const newProduct = new Product(req.body);
    await newProduct.save();
    reply
      .status(201)
      .send({ message: "Tạo sản phẩm thành công!", product: newProduct });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi tạo sản phẩm!", error: err });
  }
};

//Cập nhật sản phẩm
exports.updateProduct = async (req, reply) => {
  const { id } = req.params;
  try {
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updateProduct) {
      return reply.status(404).send({ message: "Không tìm thấy sản phẩm!" });
    }
    reply.send({
      message: "Cập nhật sản phẩm thành công!",
      product: updateProduct
    });
  } catch (err) {
    reply
      .status(500)
      .send({ message: "Lỗi khi cập nhật sản phẩm!", error: err });
  }
};

//Xóa sản phẩm
exports.deleteProduct = async (req, reply) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return reply.status(404).send({ message: "Không tìm thấy sản phẩm!" });
    }
    reply.send({ message: "Xóa sản phẩm thành công!" });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi xóa sản phẩm!", error: err });
  }
};
