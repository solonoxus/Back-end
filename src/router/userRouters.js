const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { registerSchema, loginSchema, updateProfileSchema } = require('../schemas/userSchema');

async function userRoutes(fastify, options) {
  // Routes công khai
  // Đăng ký
  fastify.post('/register', {
    schema: {
      body: registerSchema
    }
  }, userController.register);

  // Đăng nhập
  fastify.post('/login', {
    schema: {
      body: loginSchema
    }
  }, userController.login);

  // Routes yêu cầu authentication
  fastify.register(async function authenticatedRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);

    // Lấy thông tin user hiện tại
    fastify.get('/me', userController.getCurrentUser);

    // Cập nhật thông tin cá nhân
    fastify.put('/me', {
      schema: {
        body: updateProfileSchema
      }
    }, userController.updateProfile);

    // Đổi mật khẩu
    fastify.put('/change-password', {
      schema: {
        body: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: { type: 'string', minLength: 6 },
            newPassword: { type: 'string', minLength: 6 }
          }
        }
      }
    }, userController.changePassword);

    // Đăng xuất
    fastify.post('/logout', userController.logout);

    // Upload avatar
    fastify.post('/avatar', userController.uploadAvatar);

    // Xóa avatar
    fastify.delete('/avatar', userController.deleteAvatar);

    // Lấy lịch sử đơn hàng
    fastify.get('/orders', userController.getOrderHistory);

    // Lấy sản phẩm yêu thích
    fastify.get('/favorites', userController.getFavorites);

    // Thêm sản phẩm yêu thích
    fastify.post('/favorites/:productId', {
      schema: {
        params: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string' }
          }
        }
      }
    }, userController.addFavorite);

    // Xóa sản phẩm yêu thích
    fastify.delete('/favorites/:productId', {
      schema: {
        params: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string' }
          }
        }
      }
    }, userController.removeFavorite);
  });
}

module.exports = userRoutes;