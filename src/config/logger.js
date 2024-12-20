const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Cấu hình logger
const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    targets: [
      // Console logger với pino-pretty trong development
      ...(process.env.NODE_ENV === 'development' ? [{
        target: 'pino-pretty',
        level: 'debug',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          colorize: true
        }
      }] : []),
      
      // File logger cho errors
      {
        target: 'pino/file',
        level: 'error',
        options: {
          destination: path.join(logsDir, 'error.log'),
          mkdir: true
        }
      }
    ]
  },
  
  // Thêm thông tin về môi trường
  base: {
    env: process.env.NODE_ENV
  },

  // Format timestamp
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
});

// Middleware để log requests
const requestLogger = (request, reply, done) => {
  const startTime = Date.now();

  // Log khi request kết thúc
  reply.onSend((err, payload) => {
    logger.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: Date.now() - startTime
    }, 'request completed');
  });

  done();
};

module.exports = {
  logger,
  requestLogger
};