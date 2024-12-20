const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');
const { contactSchema } = require('../schemas/contactSchema');

async function contactRoutes(fastify, options) {
  // Gửi liên hệ mới
  fastify.post('/', {
    schema: {
      body: contactSchema
    }
  }, contactController.createContact);

  // Routes yêu cầu authentication
  fastify.register(async function authenticatedRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);

    // Lấy danh sách liên hệ của user
    fastify.get('/me', contactController.getUserContacts);

    // Cập nhật trạng thái đã đọc
    fastify.put('/:id/read', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, contactController.markAsRead);
  });

  // Routes cho admin
  fastify.register(async function adminRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);
    fastify.addHook('preHandler', require('../middleware/adminAuth'));

    // Lấy tất cả liên hệ
    fastify.get('/', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'resolved', 'all'] },
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1 }
          }
        }
      }
    }, contactController.getAllContacts);

    // Xóa liên hệ
    fastify.delete('/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, contactController.deleteContact);

    // Phản hồi liên hệ
    fastify.post('/:id/reply', {
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
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1 }
          }
        }
      }
    }, contactController.replyContact);
  });
}

module.exports = contactRoutes;