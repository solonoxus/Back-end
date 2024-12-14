// Add to src/services/authService.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET;
  }

  async generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, this.secretKey, {
      expiresIn: "24h"
    });
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = new AuthService();
