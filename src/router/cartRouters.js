const cartController = require('../controllers/cartController');

async function routes(fastify, options) {
  fastify.put('/:username', cartController.updateCart); // Cập nhật giỏ hàng
  fastify.get('/:username', cartController.getCart); // Lấy giỏ hàng
}

module.exports = routes;