const userController = require("../controllers/userController");

async function routes(fastify, options) {
  fastify.get('/', userController.getUser);
  fastify.get('/current', userController.getCurrentUser);
  fastify.post('/register', userController.createUser);
  fastify.post('/login', userController.loginUser);
  fastify.post('/logout', userController.logoutUser);
  fastify.delete('/:username', userController.deleteUser);
  fastify.put('/:username', userController.updateUser);
}

module.exports = routes;