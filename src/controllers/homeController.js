exports.getHome = async (req, res) => {
    reply.view('index',{title: 'Trang Chủ', message: 'Chào mừng đến với cửa hàng!'});
};