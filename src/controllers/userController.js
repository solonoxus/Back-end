//Phương thức	API Endpoint	            Hành động
//GET	        /api/users	                Lấy danh sách người dùng
//POST	        /api/users/register	        Đăng ký người dùng mới
//POST	        /api/users/login	        Đăng nhập người dùng
//DELETE	    /api/users/:username	    Xóa người dùng
//PUT	        /api/users/:username	    Cập nhật trạng thái người dùng

const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Lấy danh sách người dùng
exports.getUser = async (request, reply) => {
  try {
    const users = await User.find(); // Sử dụng model User
    reply.view("user", { title: "Danh sách người dùng", users });
  } catch (error) {
    reply
      .status(500)
      .send({ message: "Lỗi khi lấy danh sách người dùng!", error });
  }
};

// Đăng ký người dùng mới
exports.createUser = async (request, reply) => {
  try {
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return reply.status(400).send({ message: "Thiếu thông tin người dùng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    reply
      .status(201)
      .send({ message: "Đăng ký người dùng thành công!", user: newUser });
  } catch (err) {
    reply
      .status(500)
      .send({ message: "Lỗi khi đăng ký người dùng!", error: err });
  }
};

// Đăng nhập người dùng
exports.loginUser = async (req, reply) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({ message: "Sai email hoặc mật khẩu!" });
    }
    reply.send({ message: "Đăng nhập thành công!", user });
  } catch (err) {
    reply.status(500).send({ message: "Lỗi khi đăng nhập!", error: err });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, reply) => {
    const { username } = req.params;
    try {
      const user = await User.findOneAndDelete({ username });
      if (!user) {
        return reply.status(404).send({ message: "Không tìm thấy người dùng!" });
      }
      reply.send({ message: "Xóa người dùng thành công!" });
    } catch (err) {
      reply.status(500).send({ message: "Lỗi khi xóa người dùng!", error: err });
    }
  };

