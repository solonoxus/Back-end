const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

async function cartRoutes(fastify, options) {
  // Tất cả cart routes đều cần auth
  fastify.addHook('preHandler', auth);

  // Lấy giỏ hàng của user hiện tại
  fastify.get('/', cartController.getCart);

  // Thêm sản phẩm vào giỏ
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'number', minimum: 1 }
        }
      }
    }
  }, cartController.addToCart);

  // Cập nhật số lượng sản phẩm trong giỏ
  fastify.put('/', {
    schema: {
      body: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'number', minimum: 0 }
        }
      }
    }
  }, cartController.updateCartItem);

  // Xóa sản phẩm khỏi giỏ
  fastify.delete('/:productId', {
    schema: {
      params: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string' }
        }
      }
    }
  }, cartController.removeFromCart);

  // Xóa toàn bộ giỏ hàng
  fastify.delete('/', cartController.clearCart);
}

module.exports = cartRoutes;