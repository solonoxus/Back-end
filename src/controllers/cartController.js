const Cart = require('../models/cartModel');
const User = require('../models/userModel');

// Cập nhật giỏ hàng
exports.updateCart = async (req, reply) => {
  const { username } = req.params;
  const { products } = req.body;

  try {
    // Tìm người dùng
    const user = await User.findOne({ username });
    if (!user) {
      return reply.status(404).send({ message: "Không tìm thấy người dùng!" });
    }

    // Cập nhật giỏ hàng
    const cart = await Cart.findOneAndUpdate(
      { userId: user._id },
      { products },
      { new: true, upsert: true } // Tạo mới nếu không tìm thấy
    );

    reply.send({ message: "Cập nhật giỏ hàng thành công!", cart });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi cập nhật giỏ hàng!", error: err });
  }
};

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, reply) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return reply.status(404).send({ message: "Không tìm thấy người dùng!" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    reply.send({ success: true, cart });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi lấy giỏ hàng!", error: err });
  }
};