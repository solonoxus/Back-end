const adminController = require('../controllers/adminController');
async function adminRoutes(fastify, options) {
    fastify.get('./Admin/admin', adminController.renderAdmin);
}

module.exports = adminRoutes;