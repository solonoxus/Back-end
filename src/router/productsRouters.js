const productsController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { productSchema } = require('../schemas/productSchema');

async function productRoutes(fastify, options) {
  // API Routes (phải đặt trước routes chính)
  fastify.get('/api/products/search', productsController.searchProductsApi);
  fastify.get('/api/products/category/:category', productsController.getProductsByCategoryApi);
  fastify.get('/api/products/brand/:brand', productsController.getProductsByBrandApi);
  fastify.get('/api/products/:id', productsController.getProductByIdApi);
  fastify.get('/api/products', productsController.getProductsApi);
  
  // Admin Routes (cần xác thực)
  fastify.post('/api/products', { 
    schema: {
      body: productSchema
    },
    preHandler: [auth, adminAuth] 
  }, productsController.addProductApi);
  fastify.put('/api/products/:id', { 
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: productSchema
    },
    preHandler: [auth, adminAuth] 
  }, productsController.updateProductApi);
  fastify.delete('/api/products/:id', { 
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [auth, adminAuth] 
  }, productsController.deleteProductApi);
  fastify.get('/api/products/:id/stock', { 
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [auth, adminAuth] 
  }, productsController.checkStockApi);

  // Upload ảnh sản phẩm
  fastify.post('/:id/images', { 
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [auth, adminAuth] 
  }, productsController.uploadImages);

  // Xóa ảnh sản phẩm
  fastify.delete('/:id/images/:imageId', { 
    schema: {
      params: {
        type: 'object',
        required: ['id', 'imageId'],
        properties: {
          id: { type: 'string' },
          imageId: { type: 'string' }
        }
      }
    },
    preHandler: [auth, adminAuth] 
  }, productsController.deleteImage);

  // Public Routes
  fastify.get('/search', productsController.searchProducts);
  fastify.get('/category/:category', productsController.getProductsByCategory);
  fastify.get('/brand/:brand', productsController.getProductsByBrand);
  fastify.get('/:id', productsController.getProductById);
  fastify.get('/', productsController.getProducts);
}

module.exports = productRoutes;