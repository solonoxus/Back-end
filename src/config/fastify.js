const fastify = require("fastify");
const fastifyFormBody = require("@fastify/formbody");
const path = require("path");

const createFastify = () => {
  const app = fastify({ 
    logger: true,
    ignoreTrailingSlash: true
  });

  // Đăng ký các plugins
  app.register(fastifyFormBody);
  app.register(require("@fastify/cors")); // Thêm CORS

  // Đăng ký view engine
  app.register(require("@fastify/view"), {
    engine: {
      pug: require("pug")
    },
    root: path.join(__dirname, "../views"),
    options: {
      pretty: true,
      debug: false
    }
  });

  // Static files
  app.register(require("@fastify/static"), {
    root: path.join(__dirname, "../public"),
    prefix: "/public/",
    decorateReply: false
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    // Xử lý các loại lỗi cụ thể
    if (error.validation) {
      reply.status(400).send({
        error: "Validation Error",
        message: error.message
      });
      return;
    }

    reply.status(500).send({
      error: "Internal Server Error",
      message: "Đã xảy ra lỗi, vui lòng thử lại sau"
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: "Not Found",
      message: "Route không tồn tại"
    }); 
  });

  return app;
};

module.exports = createFastify;
