const createFastify = require("./config/fastify");
const connectDatabase = require("./config/database");
const { PORT, NODE_ENV } = require("./config/environment");

let app;

const start = async () => {
  try {
    // Khởi tạo Fastify app
    app = await createFastify();

    // Kết nối database trước
    await connectDatabase();

    // Đăng ký routes
    app.register(require("./router/homeRouters"));
    app.register(require("./router/userRouters"), { prefix: "/api/users" });
    app.register(require("./router/cartRouters"), { prefix: "/api/cart" });
    app.register(require("./router/contactRouters"), { prefix: "/api/contact" });
    app.register(require("./router/adminRouters"), { prefix: "/api/admin" });
    app.register(require("./router/productsRouters"), { prefix: "/products" });
    app.register(require("./router/orderRouters"), { prefix: "/api/orders" });

    // Xử lý lỗi chung cho tất cả routes
    app.setErrorHandler((error, request, reply) => {
      console.error("❌ Lỗi:", error);
      reply.status(500).send({ 
        error: "Lỗi server", 
        message: error.message 
      });
    });

    // Sau khi database connected, start server với IPv4
    await app.listen({ 
      port: PORT, 
      host: '127.0.0.1' // Chỉ định rõ IPv4 thay vì dùng HOST
    });
    
    const serverUrl = `✅ http://127.0.0.1:${PORT}`;
    console.log(`
🚀 Server đang chạy trong môi trường ${NODE_ENV} ✅
📡 Server URL: ${serverUrl}
    `);

  } catch (err) {
    console.error("❌ Lỗi khởi động server:", err);
    process.exit(1);
  }
};

// Xử lý lỗi không được bắt
process.on("uncaughtException", (err) => {
  console.error("❌ Lỗi không được bắt:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Lỗi không được xử lý:", err);
  process.exit(1);
});

// Xử lý tắt server
process.on('SIGTERM', () => {
  console.log('👋 Nhận được signal SIGTERM, đang tắt server...');
  process.exit(0);
});

// Khởi động server
start();