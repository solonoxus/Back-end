const Product = require('../models/productModel');

const homeController = {
  // Lấy sản phẩm nổi bật
  async getFeaturedProducts(req, reply) {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(8);

      return reply.send(products);
    } catch (error) {
      console.error('Error getting featured products:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy sản phẩm nổi bật' });
    }
  },

  // Lấy danh sách danh mục
  async getCategories(req, reply) {
    try {
      const categories = await Product.distinct('category');
      return reply.send(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách danh mục' });
    }
  },

  // Lấy danh sách thương hiệu
  async getBrands(req, reply) {
    try {
      const brands = await Product.distinct('brand');
      return reply.send(brands);
    } catch (error) {
      console.error('Error getting brands:', error);
      return reply.status(500).send({ message: 'Lỗi khi lấy danh sách thương hiệu' });
    }
  },

  // Tìm kiếm sản phẩm
  async searchProducts(req, reply) {
    try {
      const { q, category, brand, sort = 'createdAt', page = 1, limit = 12 } = req.query;

      const query = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }
      if (category) query.category = category;
      if (brand) query.brand = brand;

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(query)
      ]);

      return reply.send({
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return reply.status(500).send({ message: 'Lỗi khi tìm kiếm sản phẩm' });
    }
  }
};

module.exports = homeController;