const cartRouters = require('../controllers/cartController');
async function cartRoutes(fastify, options) {
    fastify.get('/cart', cartRouters.renderCart);
}

module.exports = cartRoutes;