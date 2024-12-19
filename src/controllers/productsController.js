const Product = require('../models/productModel');

const productsController = {
  // Lấy danh sách sản phẩm với filter và phân trang
  async getProducts(req, reply) {
    try {
      const { 
        category,
        search,
        sort = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      const query = {};
      const sortOptions = {};
      sortOptions[sort] = order === 'desc' ? -1 : 1;

      // Filter theo category
      if (category) {
        query.category = category;
      }

      // Tìm kiếm theo tên
      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;
      
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(query)
      ]);

      return reply.code(200).send({
        success: true,
        data: {
          products,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy chi tiết sản phẩm
  async getProduct(req, reply) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Tìm kiếm sản phẩm theo tên
  async searchProducts(req, reply) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return reply.code(400).send({
          success: false,
          message: 'Vui lòng nhập từ khóa tìm kiếm'
        });
      }

      const products = await Product.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

      return reply.code(200).send({
        success: true,
        data: products
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Lấy sản phẩm theo mã
  async getProductByCode(req, reply) {
    try {
      const { code } = req.params;
      const product = await Product.findOne({ masp: code });

      if (!product) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Đánh giá sản phẩm
  async rateProduct(req, reply) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (rating < 1 || rating > 5) {
        return reply.code(400).send({
          success: false,
          message: 'Đánh giá phải từ 1 đến 5 sao'
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return reply.code(404).send({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Cập nhật rating
      const newRateCount = product.rateCount + 1;
      const newStar = ((product.star * product.rateCount) + rating) / newRateCount;

      product.star = newStar;
      product.rateCount = newRateCount;
      await product.save();

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = productsController;