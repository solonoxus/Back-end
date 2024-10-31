// Import Fastify với logger
const fastify = require("fastify")({ logger: true });
const path = require("path");

// Đăng ký fastify-view cho Pug
fastify.register(require("@fastify/view"), {
  engine: {
    pug: require("pug"), // Thêm phần này để sử dụng Pug
  },
  root: path.join(__dirname, "res", "views", ), // Đường dẫn tới thư mục chứa view
  viewExt: "pug", // Đuôi file của template
});


// In-memory data store
let items = [];

// Kiểm tra đường dẫn chính xác
console.log(
  "Đường dẫn views:",
  path.join(__dirname, "res", "views", "layouts")
);
// Đăng ký @fastify/static để phục vụ các tệp tĩnh
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'), // Đường dẫn tới thư mục chứa các file tĩnh
    prefix: '/public/' // Tiền tố đường dẫn
});
// Declare routes

// Create
fastify.post("/items", async (request, reply) => {
  const item = request.body;
  items.push(item);
  return item;
});

fastify.get("/news-tin", async (request, reply) => {
  return reply.view("news", { items: items }); // Đã tự động thêm đuôi .pug
});

// Read all
fastify.get("/tin-tuc", async (request, reply) => {
  return reply.view("home", { items: items }); // Đã tự động thêm đuôi .pug
});

// Read one
fastify.get("/items/:id", async (request, reply) => {
  const id = request.params.id;
  const item = items.find((i) => i.id === id);
  if (item) {
    return item;
  } else {
    reply.status(404).send({ message: "Item not found" });
  }
});

// Update
fastify.put("/items/:id", async (request, reply) => {
  const id = request.params.id;
  const updatedItem = request.body;
  let index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index] = updatedItem;
    return updatedItem;
  } else {
    reply.status(404).send({ message: "Item not found" });
  }
});

// Delete
fastify.delete("/items/:id", async (request, reply) => {
  const id = request.params.id;
  let index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    return { message: "Item deleted" };
  } else {
    reply.status(404).send({ message: "Item not found" });
  }
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
