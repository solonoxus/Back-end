//Phương thức	API Endpoint	Hành động
//GET	    /api/products	      Lấy danh sách sản phẩm
//GET	    /api/products/:id	  Lấy sản phẩm theo ID
//POST	  /api/products	      Tạo sản phẩm mới
//PUT	    /api/products/:id	  Cập nhật sản phẩm
//DELETE	/api/products/:id	  Xóa sản phẩm

const Product = require("../models/productModel");

//lấy tất cả sản phẩm
exports.getAllProducts = async (_req, reply) => {
  try {
    const products = await Product.find();
    reply.view("products", { title: "Danh sách sản phẩm", products });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi lấy sản phẩm!", error: err });
  }
};

// Thêm phương thức mới cho admin
exports.getProductsAdmin = async (_req, reply) => {
  try {
    const products = await Product.find();
    return reply.send({
      success: true,
      products: products
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: "Lỗi khi lấy sản phẩm!",
      error: err
    });
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
    const { masp, name, company, price } = req.body;

    const existingProduct = await Product.findOne({ masp });
    if (existingProduct) {
      return reply.status(400).send({ message: "Mã sản phẩm đã tồn tại!" });
    }

    const newProduct = new Product(req.body);
    await newProduct.save();

    reply.status(201).send({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi tạo sản phẩm!", error: err });
  }
};

//Cập nhật sản phẩm
exports.updateProduct = async (req, reply) => {
  const { masp } = req.params;
  const updateData = req.body;

  try {
    const product = await Product.findOneAndUpdate({ masp }, updateData, { new: true });
    if (!product) {
      return reply.status(404).send({ message: "Không tìm thấy sản phẩm!" });
    }
    reply.send({ message: "Cập nhật sản phẩm thành công!", product });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi cập nhật sản phẩm!", error: err });
  }
};

//Xóa sản phẩm
exports.deleteProduct = async (req, reply) => {
  const { masp } = req.params;
  try {
    const product = await Product.findOneAndDelete({ masp });
    if (!product) {
      return reply.status(404).send({ message: "Không tìm thấy sản phẩm!" });
    }
    reply.send({ message: "Xóa sản phẩm thành công!" });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi xóa sản phẩm!", error: err });
  }
};
exports.getStatistics = async (_req, reply) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await calculateRevenue(); // Hàm tính doanh thu
    const totalOrders = await countOrders(); // Hàm đếm đơn hàng
    const totalUsers = await countUsers(); // Hàm đếm users

    return reply.send({
      success: true,
      statistics: {
        totalProducts,
        totalRevenue,
        totalOrders,
        totalUsers
      }
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: "Lỗi khi lấy thống kê!",
      error: err
    });
  }
};
