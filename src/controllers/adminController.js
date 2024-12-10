exports.getDashboard = async (req, res) => {
    reply.view('Admin/admin', { title: 'Admin Dashboard',message : 'Trang Quản Lí Hệ Thống' });
};