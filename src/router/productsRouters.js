const productsRouter = require('../controllers/productsController');

async function productsRoutes(fastify, options) {
    fastify.get('/products', productsRouter.getProductsList);
}

module.exports = productsRoutes;