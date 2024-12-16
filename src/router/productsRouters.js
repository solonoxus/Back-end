const productsController = require("../controllers/productsController");

async function routes(fastify, options) {
  // Routes cho products
  fastify.get("/api/products", productsController.getAllProducts);
  fastify.get("/api/products/:id", productsController.getProductById);
  fastify.post("/api/products", productsController.createProduct);
  fastify.put("/api/products/:masp", productsController.updateProduct);
  fastify.delete("/api/products/:masp", productsController.deleteProduct);
  fastify.get("/api/products/statistics", productsController.getStatistics);

  // Nếu bạn muốn có route cho trang chủ, hãy sử dụng đường dẫn khác
  fastify.get("/", async (req, reply) => {
    // Có thể trả về một view hoặc một thông điệp nào đó
    reply.send({ message: "Welcome to the homepage!" });
  });
}

module.exports = routes;
