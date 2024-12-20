const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

async function orderRoutes(fastify, options) {
  // Routes cho user
  fastify.register(async function userRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);

    // Tạo đơn hàng mới
    fastify.post('/', {
      schema: {
        body: {
          type: 'object',
          required: ['shippingAddress', 'paymentMethod'],
          properties: {
            shippingAddress: { type: 'string' },
            paymentMethod: { type: 'string', enum: ['cod', 'banking'] },
            note: { type: 'string' }
          }
        }
      }
    }, orderController.createOrder);

    // Lấy danh sách đơn hàng của user
    fastify.get('/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1 }
          }
        }
      }
    }, orderController.getOrders);

    // Lấy chi tiết đơn hàng
    fastify.get('/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, orderController.getOrder);

    // Hủy đơn hàng
    fastify.post('/:id/cancel', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string' }
          }
        }
      }
    }, orderController.cancelOrder);
  });

  // Routes cho admin
  fastify.register(async function adminRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);
    fastify.addHook('preHandler', adminAuth);

    // Lấy tất cả đơn hàng (admin)
    fastify.get('/admin', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            fromDate: { type: 'string', format: 'date' },
            toDate: { type: 'string', format: 'date' },
            search: { type: 'string' },
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1 }
          }
        }
      }
    }, orderController.getAllOrders);

    // Cập nhật trạng thái đơn hàng (admin)
    fastify.put('/:id/status', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { 
              type: 'string',
              enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']
            },
            note: { type: 'string' }
          }
        }
      }
    }, orderController.updateOrderStatus);
  });
}

module.exports = orderRoutes;