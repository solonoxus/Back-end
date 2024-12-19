const createFastify = require("./config/fastify");
const connectDatabase = require("./config/database");
const { PORT, HOST, NODE_ENV } = require("./config/environment");

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
    // Kết nối database trước
    await connectDatabase();
    
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
process.on('uncaughtException', (err) => {
  console.error('❌ Lỗi không được bắt:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise bị reject nhưng không được xử lý:', promise, 'lý do:', reason);
  process.exit(1);
});

// Xử lý tắt server
const shutdown = async (signal) => {
  console.log(`\n${signal} đã nhận được. Đang tắt server...`);
  try {
    await app.close();
    console.log('✅ Server đã đóng thành công');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi đóng server:', err);
    process.exit(1);
  }
};

// Đăng ký các signal handlers
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => shutdown(signal));
});

// Khởi động server
start();