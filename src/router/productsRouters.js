const productsController = require('../controllers/productsController');
const auth = require('../middleware/auth');

async function productRoutes(fastify, options) {
  // Routes công khai
  // Lấy danh sách sản phẩm
  fastify.get('/', productsController.getProducts);

  // Lấy chi tiết sản phẩm
  fastify.get('/:id', productsController.getProduct);

  // Tìm kiếm sản phẩm
  fastify.get('/search', productsController.searchProducts);

  // Routes cho admin
  fastify.register(async function adminRoutes(fastify, options) {
    // Thêm middleware auth cho tất cả routes trong group này
    fastify.addHook('preHandler', auth);

    // Thêm sản phẩm mới
    fastify.post('/', productsController.addProduct);

    // Cập nhật sản phẩm
    fastify.put('/:id', productsController.updateProduct);

    // Xóa sản phẩm
    fastify.delete('/:id', productsController.deleteProduct);
  });
}

module.exports = productRoutes;