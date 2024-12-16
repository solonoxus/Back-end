exports.getHome = async (req, reply) => {
  try {
     // Khai báo biến tuKhoaTimKiem trước khi sử dụng
     const tuKhoaTimKiem = req.query.search || '';
    
    return reply.view("index", {
      title: "Trang Chủ",
      message: "Chào mừng đến với cửa hàng!",
      tuKhoaTimKiem: tuKhoaTimKiem
    });
  } catch (error) {
    console.error("Lỗi render trang chủ:", error);
    reply.status(500).send({ error: "Lỗi server" });
  }
  
};
exports.getTinTuc = async (req, reply) => {
  try {
    return reply.view("tintuc", {
      title: "Tin Tức",
    });
  } catch (error) {
    console.error("Lỗi render trang tin tức:", error);
    reply.status(500).send({ error: "Lỗi server" });
  }
};

exports.getGioiThieu = async (req, reply) => {
  try {
    return reply.view("gioithieu", {
      title: "Giới Thiệu",
    });
  } catch (error) {
    console.error("Lỗi render trang giới thiệu:", error);
    reply.status(500).send({ error: "Lỗi server" });
  }
};

exports.getTrungTamBaoHanh = async (req, reply) => {
  try {
    return reply.view("trungtambaohanh", {
      title: "Trung Tâm Bảo Hành",
    });
  } catch (error) {
    console.error("Lỗi render trang bảo hành:", error);
    reply.status(500).send({ error: "Lỗi server" });
  }
};
exports.getLienHe = async (request, reply) => {
  try {
    reply.view("/lienhe", { title: "Liên hệ" });
  } catch (error) {
    reply.status(500).send({ message: "Lỗi khi hiển thị trang liên hệ!", error });
  }
};
