const userRouter = require('../controllers/userController');

async function userRoutes(fastify, options) {
    fastify.get('/user', userRouter.getUser);
}

module.exports = userRoutes;