const pino = require("pino");
const { multistream } = require("pino-multi-stream");
const fs = require("fs");
const path = require("path");

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Cấu hình luồng log
const streams = [
  // Log console (đẹp và dễ đọc)
  {
    stream: require("pino-pretty")({
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname"
    })
  },
  // Log file chi tiết
  {
    stream: fs.createWriteStream(path.join(logDir, "app.log"), { flags: "a" }),
    level: "info"
  },
  // Log file lỗi riêng
  {
    stream: fs.createWriteStream(path.join(logDir, "errors.log"), {
      flags: "a"
    }),
    level: "error"
  }
];

// Tạo logger
const logger = pino(
  {
    level: "info",
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      }
    }
  },
  multistream(streams)
);

module.exports = logger;
