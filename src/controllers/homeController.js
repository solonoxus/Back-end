exports.getHome = async (req, reply) => {
    return reply.view('index',{title: 'Trang Chủ', message: 'Chào mừng đến với cửa hàng!'});
};