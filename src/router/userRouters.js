const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

async function userRoutes(fastify, options) {
  // Đăng ký
  fastify.post('/register', userController.register);

  // Đăng nhập
  fastify.post('/login', userController.login);

  // Các routes cần xác thực
  fastify.register(async function authenticatedRoutes(fastify, options) {
    // Thêm middleware auth cho tất cả routes trong group này
    fastify.addHook('preHandler', auth);

    // Lấy thông tin user hiện tại
    fastify.get('/me', userController.getCurrentUser);

    // Cập nhật thông tin user
    fastify.put('/me', userController.updateUser);

    // Thêm sản phẩm vào giỏ hàng
    fastify.post('/cart', userController.addToCart);

    // Lấy giỏ hàng
    fastify.get('/cart', userController.getCart);
  });
}

module.exports = userRoutes;