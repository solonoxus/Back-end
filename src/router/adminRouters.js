const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

async function adminRoutes(fastify, options) {
  // Tất cả routes đều yêu cầu auth và adminAuth
  fastify.addHook('preHandler', auth);
  fastify.addHook('preHandler', adminAuth);

  // Dashboard
  fastify.get('/dashboard', adminController.getDashboard);

  // Quản lý Users
  fastify.get('/users', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          role: { type: 'string', enum: ['user', 'admin'] },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1 }
        }
      }
    }
  }, adminController.getUsers);

  fastify.get('/users/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, adminController.getUser);

  fastify.put('/users/:id', {
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
          status: { type: 'string', enum: ['active', 'inactive'] },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      }
    }
  }, adminController.updateUser);

  // Quản lý Orders
  fastify.get('/orders', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'] },
          fromDate: { type: 'string', format: 'date' },
          toDate: { type: 'string', format: 'date' },
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1 }
        }
      }
    }
  }, adminController.getOrders);

  fastify.get('/orders/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, adminController.getOrder);

  fastify.put('/orders/:id', {
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
            enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled']
          },
          note: { type: 'string' }
        }
      }
    }
  }, adminController.updateOrder);

  // Thống kê
  fastify.get('/statistics/sales', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          fromDate: { type: 'string', format: 'date' },
          toDate: { type: 'string', format: 'date' },
          groupBy: { type: 'string', enum: ['day', 'month', 'year'] }
        }
      }
    }
  }, adminController.getSalesStatistics);

  fastify.get('/statistics/products', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          fromDate: { type: 'string', format: 'date' },
          toDate: { type: 'string', format: 'date' },
          sortBy: { type: 'string', enum: ['sales', 'revenue'] },
          limit: { type: 'integer', minimum: 1 }
        }
      }
    }
  }, adminController.getProductStatistics);

  // Settings
  fastify.get('/settings', adminController.getSettings);
  
  fastify.put('/settings', {
    schema: {
      body: {
        type: 'object',
        properties: {
          siteName: { type: 'string' },
          logo: { type: 'string' },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string' },
          address: { type: 'string' },
          socialLinks: {
            type: 'object',
            properties: {
              facebook: { type: 'string' },
              twitter: { type: 'string' },
              instagram: { type: 'string' }
            }
          }
        }
      }
    }
  }, adminController.updateSettings);
}

module.exports = adminRoutes;