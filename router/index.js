// router/index.js
const newsRoutes = require("./news");

function route(app) {
  // Đăng ký các route trong news.js
  newsRoutes(app);

  // Định nghĩa các route khác
  app.get("/", async (request, reply) => {
    return reply.view("home", { items: items });
  });

  app.get("/news-tin", async (request, reply) => {
    return reply.view("news", { items: items });
  });

  app.get("/tin-tuc", async (request, reply) => {
    return reply.view("home", { items: items });
  });
}

module.exports = route;
