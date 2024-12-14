const Order = require('../models/orderModel');
const User = require('../models/userModel');

// Tạo đơn hàng mới
exports.createOrder = async (req, reply) => {
  const { userId, products } = req.body;
  try {
    const newOrder = new Order({ userId, products });
    await newOrder.save();
    reply.status(201).send({ message: "Đơn hàng đã được tạo thành công!", order: newOrder });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi tạo đơn hàng!", error: err });
  }
};

// Lấy danh sách đơn hàng của người dùng
exports.getOrdersByUser = async (req, reply) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId });
    reply.send({ success: true, orders });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi lấy danh sách đơn hàng!", error: err });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, reply) => {
  const { id } = req.params;
  const { tinhTrang } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { tinhTrang }, { new: true });
    if (!order) {
      return reply.status(404).send({ message: "Không tìm thấy đơn hàng!" });
    }
    reply.send({ message: "Cập nhật trạng thái đơn hàng thành công!", order });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi cập nhật trạng thái đơn hàng!", error: err });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, reply) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return reply.status(404).send({ message: "Không tìm thấy đơn hàng!" });
    }
    reply.send({ message: "Xóa đơn hàng thành công!" });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi xóa đơn hàng!", error: err });
  }
};
