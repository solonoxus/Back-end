const homeController = require("../controllers/homeController");

async function homeRoutes(fastify, options) {
    fastify.get("/", homeController.getHome);
    }
module.exports = homeRoutes;