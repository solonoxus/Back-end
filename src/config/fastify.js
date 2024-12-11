const fastify = require('fastify');
const fastifyFormBody = require('@fastify/formbody'); 
const path = require('path');

const createFastify = () => {
  // Tạo instance Fastify
  const app = fastify({ logger: true });

  // Đăng ký plugin xử lý form-body
  app.register(fastifyFormBody);

  // Đăng ký view engine
  app.register(require('@fastify/view'), {
    engine: {
      pug: require('pug'),
    },
    root: path.join(__dirname, '../views'),
  });

  // Đăng ký static files
  app.register(require('@fastify/static'), {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
  });

  return app; 
};
module.exports = createFastify; 