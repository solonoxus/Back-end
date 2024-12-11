const userController = require("../controllers/userController");

async function userRoutes(fastify, options) {

  fastify.get("/users", userController.getUser);
  fastify.post("/users", userController.createUser);
  fastify.delete('/users/:id',userController.deleteUser);

}

module.exports = userRoutes;
