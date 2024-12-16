exports.getHome = async (req, reply) => {
  try {
    return reply.view("index", {
      title: "Trang Chủ",
      message: "Chào mừng đến với cửa hàng!",
    });
  } catch (error) {
    console.error("Lỗi render trang chủ:", error);
    reply.status(500).send({ error: "Lỗi server" });
  }
};
