const fastify = require('fastify');
const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const config = require('./environment');
const fastifyStatic = require('@fastify/static');
const fastifyView = require('@fastify/view');
const path = require('path');

const buildApp = async () => {
  // Khởi tạo Fastify với logger
  const app = fastify({
    logger: {
      level: config.NODE_ENV === 'development' ? 'debug' : 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  });

  try {
    // Đăng ký plugins
    await app.register(cors, {
      origin: '*',
      credentials: true
    });

    await app.register(jwt, {
      secret: config.JWT_SECRET
    });

    await app.register(multipart, {
      limits: {
        fileSize: config.MAX_FILE_SIZE
      }
    });

    // Static files
    await app.register(fastifyStatic, {
      root: path.join(__dirname, '../public'),
      prefix: '/public/'
    });

    return app;
  } catch (err) {
    console.error('❌ Lỗi khởi tạo Fastify:', err);
    throw err;
  }
};

module.exports = buildApp;