const fastify = require('fastify');
const path = require('path'); 

const createFastify = () => {
  const app = fastify({logger: true});  

  // Đăng ký view engine
  app.register(require('@fastify/view'),{
    engine: {
      pug: require('pug')
    },
    root: 'src/res/views',
  });

  app.register(require('@fastify/static'), {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
  });

  return app;

};

module.exports = createFastify;