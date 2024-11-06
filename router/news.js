// router/news.js
module.exports = (app) => {
  // Định nghĩa route cho "/new"
  app.get("/new", async (request, reply) => {
    const newControllers = require("../app/controllers/newControllers");
    // Giả sử `newControllers.index` trả về dữ liệu cho route này
    const data = await newControllers.index();
    reply.send(data); // Trả về dữ liệu từ controller
  });
};

