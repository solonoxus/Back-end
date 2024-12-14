const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.getCurrentUser = async (token) => {
  // Implement JWT verification here
  try {
    // Verify token and get user
    const user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    return null;
  }
};

exports.getListUser = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    console.error('Error getting users:', err);
    return [];
  }
};

exports.setCurrentUser = async (userData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userData._id,
      userData,
      { new: true }
    );
    return user;
  } catch (err) {
    console.error('Error updating user:', err);
    return null;
  }
};
