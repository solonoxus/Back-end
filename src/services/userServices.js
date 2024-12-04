// src/services/userService.js
const User = require('../app/models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const createError = require('http-errors');

class UserService {
  constructor() {
    this.userModel = User;
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async getAllUsers(query = {}) {
    try {
      const users = await this.userModel
        .find({ ...query, active: { $ne: false } })
        .select('-password');
      return users;
    } catch (error) {
      throw createError(500, 'Error fetching users');
    }
  }

  async getUserById(id) {
    try {
      const user = await this.userModel
        .findById(id)
        .select('-password');
      
      if (!user || !user.active) {
        throw createError(404, 'User not found');
      }
      
      return user;
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw createError(404, 'User not found');
      }
      throw createError(500, 'Error fetching user');
    }
  }

  async createUser(userData) {
    try {
      const existingUser = await this.userModel.findOne({ 
        email: userData.email,
        active: { $ne: false }
      });

      if (existingUser) {
        throw createError(400, 'Email already exists');
      }

      const user = await this.userModel.create(userData);
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error.message);
      }
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await this.userModel
        .findOne({ email, active: { $ne: false } })
        .select('+password');

      if (!user || !(await user.comparePassword(password))) {
        throw createError(401, 'Invalid email or password');
      }

      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw createError(401, 'Login failed');
    }
  }

  async updateUser(id, updateData) {
    try {
      if (updateData.password) {
        throw createError(400, 'This route is not for password updates');
      }

      const user = await this.userModel
        .findByIdAndUpdate(
          id,
          { ...updateData },
          { new: true, runValidators: true }
        )
        .select('-password');

      if (!user) {
        throw createError(404, 'User not found');
      }

      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error.message);
      }
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      );

      if (!user) {
        throw createError(404, 'User not found');
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw createError(500, 'Error deleting user');
    }
  }
  async renderHomePage(req, reply) {
    try {
      const message = "Welcome to the Home Page!"; // Dữ liệu muốn gửi tới view
      const courses = [
        { name: "Course A", description: "Description A" },
        { name: "Course B", description: "Description B" },
      ]; // Dữ liệu mẫu để hiển thị danh sách khóa học
  
      return reply.view("home", { message, courses }); // Render view home.pug với dữ liệu
    } catch (err) {
      return reply
        .code(500)
        .send({ error: "Error rendering home", message: err.message });
    }
  }
}

module.exports = new UserService();