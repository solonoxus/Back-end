const createFastify = require("./config/fastify");
const connectDatabase = require("./config/database");
const { PORT, HOST } = require("./config/environment");
const { connect } = require("mongoose");

const app = createFastify();

// Đăng ký routes
app.register(require("./router/homeRouters"));
app.register(require("./router/userRouters"), { prefix: "/api/users" });
app.register(require("./router/cartRouters"), { prefix: "/api/cart" });
app.register(require("./router/contactRouters"), { prefix: "/api/contact" });
app.register(require("./router/adminRouters"), { prefix: "/api/admin" });
app.register(require("./router/productsRouters"), { prefix: "/api/products" });
app.register(require("./router/orderRouters"), { prefix: "/api/orders" });

const start = async () => {
  try {
    await connectDatabase();
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server listening on ${app.server.address().port}`);
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

start();
