const Admin = require('../models/adminModel');

exports.loginAdmin = async (req, reply) => {
  try {
    const { username, pass } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || admin.pass !== pass) {
      return reply.status(401).send({ 
        success: false,
        message: 'Sai thông tin đăng nhập admin!'
      });
    }

    reply.send({ 
      success: true,
      message: 'Đăng nhập admin thành công!'
    });
  } catch (err) {
    reply.status(500).send({ 
      success: false,
      message: 'Lỗi server!',
      error: err 
    });
  }
};

exports.renderAdmin = async (req, reply) => {
    return reply.view('Admin/admin', { title: 'Admin Dashboard',message : 'Trang Quản Lí Hệ Thống' });
};