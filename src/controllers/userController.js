const User = require('../models/userModel');

exports.getUser = async (request, reply) => {
    try {
        const users = await User.find(); // Sử dụng model User
        reply.view('user', { title: 'Danh sách người dùng', users });
    } catch (error) {
        reply.status(500).send({ message: 'Lỗi khi lấy danh sách người dùng!', error });
    }
};

exports.createUser = async (request, reply) => {
    try {
        const { name, email, password } = request.body; // Sử dụng request.body thay vì req.body
        const newUser = new User({ name, email, password });
        await newUser.save();
        reply.send({ message: 'Tạo người dùng thành công!', user: newUser });
    } catch (error) {
        reply.status(500).send({ message: 'Lỗi khi tạo người dùng!', error });
    }
};

// Xóa người dùng
exports.deleteUser = async (request, reply) => {
    try {
        const { id } = request.params; // Sử dụng request.params thay vì req.params
        await User.findByIdAndDelete(id);
        reply.send({ message: 'Xóa người dùng thành công!' });
    } catch (error) {
        reply.status(500).send({ message: 'Lỗi khi xóa người dùng!', error });
    }
};