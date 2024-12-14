const adminController = require('../controllers/adminController');

async function routes(fastify, options) {
  fastify.post('/login', adminController.loginAdmin);
  // Các route khác cho admin...
}

module.exports = routes;