const userController = require("../controllers/userController");

async function routes(fastify, options) {
  fastify.get('/', userController.getUser);
  fastify.post('/register', userController.createUser);
  fastify.post('/login', userController.loginUser);
  fastify.delete('/:username', userController.deleteUser);
  fastify.put('/:username', userController.updateUser);
}

module.exports = routes;
