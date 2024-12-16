const fastify = require("fastify");
const fastifyFormBody = require("@fastify/formbody");
const fastifyHelmet = require("@fastify/helmet");
const fastifyRateLimit = require("@fastify/rate-limit");
const fastifyCompress = require("@fastify/compress");
const fastifyCors = require("@fastify/cors");
const path = require("path");

const { errorHandler } = require("./errorHandler");
const { CORS_ORIGIN, NODE_ENV } = require("./environment");

const createFastify = () => {
  const app = fastify({ 
    logger: {
      level: NODE_ENV === "development" ? "debug" : "info",
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            hostname: request.hostname,
            remoteAddress: request.ip,
            remotePort: request.socket.remotePort
          };
        }
      }
    },
    ignoreTrailingSlash: true,
    trustProxy: true
  });

  // Security middlewares
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
      }
    }
  });

  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: "Too Many Requests",
        message: `Vui lòng thử lại sau ${context.after}`
      };
    }
  });

  // CORS
  app.register(fastifyCors, {
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  // Performance middlewares
  app.register(fastifyCompress, { 
    encodings: ["gzip", "deflate"]
  });

  // Body parser
  app.register(fastifyFormBody);

  // View engine
  app.register(require("@fastify/view"), {
    engine: {
      pug: require("pug")
    },
    root: path.join(__dirname, "../views"),
    options: {
      pretty: NODE_ENV === "development",
      debug: NODE_ENV === "development",
      cache: NODE_ENV === "production"
    }
  });

  // Static files
  app.register(require("@fastify/static"), {
    root: path.join(__dirname, "../public"),
    prefix: "/public/",
    decorateReply: false,
    cacheControl: true,
    maxAge: NODE_ENV === "production" ? "1h" : "0"
  });

  // Global error handler
  app.setErrorHandler(errorHandler);

  return app;
};

module.exports = createFastify;