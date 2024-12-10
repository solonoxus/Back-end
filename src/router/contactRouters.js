const contactRouter = require('../controllers/contactController');

async function contactRoutes(fastify, options) {
    fastify.get('/contact', contactRouter.getContact);
}

module.exports = contactRoutes;
