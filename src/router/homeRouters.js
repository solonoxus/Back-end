const homeController = require("../controllers/homeController");

async function homeRoutes(fastify, options) {
    fastify.get("/home", homeController.renderHome);
    }
module.exports = homeRoutes;