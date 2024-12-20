const homeController = require('../controllers/homeController');

async function homeRoutes(fastify, options) {
  // Trang chủ
  fastify.get('/', homeController.getHomePage);

  // Trang giới thiệu
  fastify.get('/about', homeController.getAboutPage);

  // Trang liên hệ
  fastify.get('/contact', homeController.getContactPage);

  // Trang tin tức
  fastify.get('/news', homeController.getNewsPage);

  // Trang bảo hành
  fastify.get('/warranty', homeController.getWarrantyPage);

  // Health check
  fastify.get('/health', async () => ({ status: 'OK' }));
}

module.exports = homeRoutes;