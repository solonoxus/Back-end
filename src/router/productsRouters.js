const productsController = require("../controllers/productsController");

async function routes(fastify, options) {
  // Routes cho products
  fastify.get("/products", productsController.getAllProducts);
  fastify.get("/products/:id", productsController.getProductById);
  fastify.post("/products", productsController.createProduct);
  fastify.put("/products/:masp", productsController.updateProduct);
  fastify.delete("/products/:masp", productsController.deleteProduct);
  fastify.get("/products/statistics", productsController.getStatistics);
  fastify.get("/", productsController.getAllProducts);
  fastify.post("/", productsController.createProduct);
  fastify.put("/:masp", productsController.updateProduct);
  fastify.delete("/:masp", productsController.deleteProduct);
}

module.exports = routes;
