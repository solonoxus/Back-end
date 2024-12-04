const config = {
  app: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
    env: process.env.NODE_ENV || "development"
  },
  db: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/sell"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "1d"
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || "cookie-secret",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
};

module.exports = config;
