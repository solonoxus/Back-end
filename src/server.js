const createFastify = require("./config/fastify");
const connectDatabase = require("./config/database");
const { PORT, HOST } = require("./config/environment");
const { connect } = require("mongoose");

const app = createFastify();

connectDatabase();

// Đăng ký routes
app.register(require("./router/homeRouters"), { prefix: "/" });
app.register(require("./router/userRouters"), { prefix: "/user" });
app.register(require("./router/cartRouters"), { prefix: "/cart" });
app.register(require("./router/contactRouters"), { prefix: "/contact" });
app.register(require("./router/adminRouters"), { prefix: "/admin" });
app.register(require("./router/productsRouters"));

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
