const fastify = require("fastify")({ logger: true });
const path = require("path");
const autoload = require("@fastify/autoload");
require("dotenv").config();
const connectDB = require("./config/database");

const initializeServer = async () => {
  try {
    await connectDB(); // Gọi hàm kết nối MongoDB
    console.log('Server is running...');
  } catch (err) {
    console.error(err.message);
  }
};


// Đăng ký Plugins
async function registerPlugins() {
  await fastify.register(require("@fastify/view"), {
    engine: { pug: require("pug") },
    root: path.join(__dirname, "res","views"),
    options: { pretty: true }
  });

  await fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/public/"
  });

  await fastify.register(require("@fastify/formbody"));
}

// Đăng ký Routes
async function registerRoutes() {
  fastify.register(autoload, {
    dir: path.join(__dirname, "router")
  });
}

fastify.get('/favicon.ico', async (req, reply) => {
  return reply.code(204).send(); // Không có nội dung
}); 

// Kết nối và khởi chạy server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    await connectDB();

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
