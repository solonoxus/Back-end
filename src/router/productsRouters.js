const productsController = require('../controllers/productsController');

async function productsRoutes(fastify, options) {
    fastify.get('/products', productsController.getAllProducts);
    fastify.get('/products/:id', productsController.getProductById);
    fastify.post('/products', productsController.createProduct);
    fastify.put('/products/:id', productsController.updateProduct);
    fastify.delete('/products/:id', productsController.deleteProduct);
}

module.exports = productsRoutes;