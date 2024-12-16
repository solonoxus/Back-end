const productsController = require("../controllers/productsController");

async function routes(fastify, options) {
  // Routes cho products
  fastify.get("/", productsController.getAllProducts);         // Route gốc
  fastify.get("/statistics", productsController.getStatistics); // Route tĩnh
  fastify.get("/admin", productsController.getProductsAdmin);   // Route tĩnh
  fastify.get("/:id", productsController.getProductById);      // Route động
  fastify.post("/", productsController.createProduct);
  fastify.put("/:masp", productsController.updateProduct);
  fastify.delete("/:masp", productsController.deleteProduct);
}

module.exports = routes;
