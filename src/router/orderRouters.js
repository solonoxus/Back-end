const orderController = require('../controllers/orderController');

async function routes(fastify, options) {
  fastify.post('/', orderController.createOrder); // Tạo đơn hàng
  fastify.get('/user/:userId', orderController.getOrdersByUser); // Lấy danh sách đơn hàng của người dùng
  fastify.put('/:id', orderController.updateOrderStatus); // Cập nhật trạng thái đơn hàng
  fastify.delete('/:id', orderController.deleteOrder); // Xóa đơn hàng
}

module.exports = routes;
