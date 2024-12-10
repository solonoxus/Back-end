const cartRouters = require('../controllers/cartController');
async function cartRoutes(fastify, options) {
    fastify.get('/cart', cartRouters.getCart);
}

module.exports = cartRoutes;