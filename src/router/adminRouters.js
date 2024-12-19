const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

async function adminRoutes(fastify, options) {
  // Login route - không cần auth
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, adminController.login);

  // Các routes cần auth admin
  fastify.register(async function authenticatedRoutes(fastify, options) {
    fastify.addHook('preHandler', auth);
    fastify.addHook('preHandler', adminAuth);

    // Quản lý người dùng
    fastify.get('/users', adminController.getUsers);
    
    fastify.get('/users/:userId', {
      schema: {
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' }
          }
        }
      }
    }, adminController.getUser);

    fastify.put('/users/:userId/status', {
      schema: {
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'boolean' }
          }
        }
      }
    }, adminController.toggleUserStatus);

    // Quản lý sản phẩm
    fastify.post('/products', {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'code', 'price'],
          properties: {
            name: { type: 'string' },
            code: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            category: { type: 'string' },
            image: { type: 'string' }
          }
        }
      }
    }, adminController.addProduct);

    fastify.put('/products/:id', {
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
            name: { type: 'string' },
            code: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            category: { type: 'string' },
            image: { type: 'string' }
          }
        }
      }
    }, adminController.updateProduct);

    fastify.delete('/products/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, adminController.deleteProduct);
  });
}

module.exports = adminRoutes;