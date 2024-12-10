exports.renderAdmin = async (req, reply) => {
    return reply.view('Admin/admin', { title: 'Admin Dashboard',message : 'Trang Quản Lí Hệ Thống' });
};