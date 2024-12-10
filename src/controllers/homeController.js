exports.getHome = async (req, reply) => {
    reply.view('index',{title: 'Trang Chủ', message: 'Chào mừng đến với cửa hàng!'});
};