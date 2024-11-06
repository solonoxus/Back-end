// Import Fastify với logger
const fastify = require("fastify")({ logger: true });
const path = require("path");
const app = fastify; // Đổi tên fastify thành app
const route = require('../router'); // Import module từ file khác

// Đăng ký fastify-view cho Pug
app.register(require("@fastify/view"), {
  engine: {
    pug: require("pug") // Thêm phần này để sử dụng Pug
  },
  root: path.join(__dirname, "res", "views"), // Đường dẫn tới thư mục chứa view
  viewExt: "pug" // Đuôi file của template
});

// In-memory data store
let items = [];

// Kiểm tra đường dẫn chính xác
console.log(
  "Đường dẫn views:",
  path.join(__dirname, "res", "views", "layouts")
);

// Đăng ký @fastify/static để phục vụ các tệp tĩnh
app.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"), // Đường dẫn tới thư mục chứa các file tĩnh
  prefix: "/public/" // Tiền tố đường dẫn
});

// Declare routes

// Create
app.post("/items", async (request, reply) => {
  const item = request.body;
  items.push(item);
  return item;
});

// Tìm kiếm
app.get("/seach", async (request, reply) => {
  return reply.view("news", { items: items }); // Đã tự động thêm đuôi .pug
});

// // Tin tức
// app.get("/news-tin", async (request, reply) => {
//   return reply.view("news", { items: items }); // Đã tự động thêm đuôi .pug
// });

// // Read all
// app.get("/tin-tuc", async (request, reply) => {
//   return reply.view("home", { items: items }); // Đã tự động thêm đuôi .pug
// });

// Read one
app.get("/items/:id", async (request, reply) => {
  const id = request.params.id;
  const item = items.find((i) => i.id === id);
  if (item) {
    return item;
  } else {
    reply.status(404).send({ message: "Item not found" });
  }
});

// Update
app.put("/items/:id", async (request, reply) => {
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
app.delete("/items/:id", async (request, reply) => {
  const id = request.params.id;
  let index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    return { message: "Item deleted" };
  } else {
    reply.status(404).send({ message: "Item not found" });
  }
});
route(app); // Gọi hàm route từ file router/index.js

// Run the server!
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    app.log.info(`server listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
