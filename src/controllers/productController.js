const Product = require('../models/productModel');

const productController = {
  // Lấy tất cả sản phẩm
  async getProducts(req, reply) {
    try {
      const products = await Product.find();
      // Render trang index với dữ liệu sản phẩm
      return reply.view('index.pug', { products });
    } catch (error) {
      console.error('Error getting products:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
  },

  // API endpoint để lấy sản phẩm
  async getProductsApi(req, reply) {
    try {
      const products = await Product.find();
      return reply.send(products);
    } catch (error) {
      console.error('Error getting products:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
  },

  // Lấy sản phẩm theo ID
  async getProductById(req, reply) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      // Render trang chi tiết sản phẩm với dữ liệu sản phẩm
      return reply.view('product.pug', { product });
    } catch (error) {
      console.error('Error getting product:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy thông tin sản phẩm' });
    }
  },

  // API endpoint để lấy sản phẩm theo ID
  async getProductByIdApi(req, reply) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      return reply.send(product);
    } catch (error) {
      console.error('Error getting product:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy thông tin sản phẩm' });
    }
  },

  // Tìm kiếm sản phẩm
  async searchProducts(req, reply) {
    try {
      const { query, category, brand } = req.query;
      const searchQuery = {};

      if (query) {
        searchQuery.$text = { $search: query };
      }
      if (category) {
        searchQuery.category = category;
      }
      if (brand) {
        searchQuery.brand = brand;
      }

      const products = await Product.find(searchQuery);
      // Render trang kết quả tìm kiếm với dữ liệu sản phẩm
      return reply.view('search.pug', { products });
    } catch (error) {
      console.error('Error searching products:', error);
      return reply.status(500).send({ message: 'Lỗi khi tìm kiếm sản phẩm' });
    }
  },

  // API endpoint để tìm kiếm sản phẩm
  async searchProductsApi(req, reply) {
    try {
      const { query, category, brand } = req.query;
      const searchQuery = {};

      if (query) {
        searchQuery.$text = { $search: query };
      }
      if (category) {
        searchQuery.category = category;
      }
      if (brand) {
        searchQuery.brand = brand;
      }

      const products = await Product.find(searchQuery);
      return reply.send(products);
    } catch (error) {
      console.error('Error searching products:', error);
      return reply.status(500).send({ message: 'Lỗi khi tìm kiếm sản phẩm' });
    }
  },

  // Thêm sản phẩm mới
  async addProduct(req, reply) {
    try {
      const product = new Product(req.body);
      await product.save();
      // Render trang thêm sản phẩm với dữ liệu sản phẩm mới
      return reply.view('add.pug', { product });
    } catch (error) {
      console.error('Error adding product:', error);
      return reply.status(500).send({ message: 'Lỗi khi thêm sản phẩm' });
    }
  },

  // API endpoint để thêm sản phẩm mới
  async addProductApi(req, reply) {
    try {
      const product = new Product(req.body);
      await product.save();
      return reply.code(201).send(product);
    } catch (error) {
      console.error('Error adding product:', error);
      return reply.status(500).send({ message: 'Lỗi khi thêm sản phẩm' });
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(req, reply) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      // Render trang cập nhật sản phẩm với dữ liệu sản phẩm mới
      return reply.view('update.pug', { product });
    } catch (error) {
      console.error('Error updating product:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
  },

  // API endpoint để cập nhật sản phẩm
  async updateProductApi(req, reply) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      return reply.send(product);
    } catch (error) {
      console.error('Error updating product:', error);
      return reply.status(500).send({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
  },

  // Xóa sản phẩm
  async deleteProduct(req, reply) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      // Render trang xóa sản phẩm với thông báo thành công
      return reply.view('delete.pug', { message: 'Đã xóa sản phẩm' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa sản phẩm' });
    }
  },

  // API endpoint để xóa sản phẩm
  async deleteProductApi(req, reply) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      return reply.send({ message: 'Đã xóa sản phẩm' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return reply.status(500).send({ message: 'Lỗi khi xóa sản phẩm' });
    }
  },

  // Lấy sản phẩm theo danh mục
  async getProductsByCategory(req, reply) {
    try {
      const products = await Product.find({ category: req.params.category });
      // Render trang danh mục sản phẩm với dữ liệu sản phẩm
      return reply.view('category.pug', { products });
    } catch (error) {
      console.error('Error getting products by category:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy sản phẩm theo danh mục' });
    }
  },

  // API endpoint để lấy sản phẩm theo danh mục
  async getProductsByCategoryApi(req, reply) {
    try {
      const products = await Product.find({ category: req.params.category });
      return reply.send(products);
    } catch (error) {
      console.error('Error getting products by category:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy sản phẩm theo danh mục' });
    }
  },

  // Lấy sản phẩm theo thương hiệu
  async getProductsByBrand(req, reply) {
    try {
      const products = await Product.find({ brand: req.params.brand });
      // Render trang thương hiệu sản phẩm với dữ liệu sản phẩm
      return reply.view('brand.pug', { products });
    } catch (error) {
      console.error('Error getting products by brand:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy sản phẩm theo thương hiệu' });
    }
  },

  // API endpoint để lấy sản phẩm theo thương hiệu
  async getProductsByBrandApi(req, reply) {
    try {
      const products = await Product.find({ brand: req.params.brand });
      return reply.send(products);
    } catch (error) {
      console.error('Error getting products by brand:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy sản phẩm theo thương hiệu' });
    }
  },

  // Kiểm tra tồn kho
  async checkStock(req, reply) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      // Render trang kiểm tra tồn kho với dữ liệu sản phẩm
      return reply.view('stock.pug', { product });
    } catch (error) {
      console.error('Error checking stock:', error);
      return reply.status(500).send({ message: 'Lỗi khi kiểm tra tồn kho' });
    }
  },

  // API endpoint để kiểm tra tồn kho
  async checkStockApi(req, reply) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return reply.status(404).send({ message: 'Không tìm thấy sản phẩm' });
      }
      return reply.send({ stock: product.stock });
    } catch (error) {
      console.error('Error checking stock:', error);
      return reply.status(500).send({ message: 'Lỗi khi kiểm tra tồn kho' });
    }
  }
};

module.exports = productController;
