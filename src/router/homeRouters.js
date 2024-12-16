const homeController = require("../controllers/homeController");

async function homeRoutes(fastify, options) {
    fastify.get("/", homeController.getHome);
    fastify.get("/views/index", homeController.getHome);
    fastify.get("/views/tintuc", homeController.getTinTuc);
    fastify.get("/views/gioithieu", homeController.getGioiThieu);
    fastify.get("/views/trungtambaohanh", homeController.getTrungTamBaoHanh);
    fastify.get('/lienhe', homeController.getLienHe);
    }
module.exports = homeRoutes;