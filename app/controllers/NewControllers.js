// app/controllers/NewController.js
class NewController { // Tạo class NewController
    // [GET] /new-tin
    index(req, reply) { // Phương thức để xử lý yêu cầu
        // Đảm bảo rằng `items` đã được định nghĩa
        const items = []; // Hoặc lấy `items` từ nơi khác nếu đã có dữ liệu

        // Sử dụng `reply.view` để render file .pug
        reply.view("home", { items: items }); // Tự động thêm đuôi .pug
    }
}

module.exports = new NewController(); // Export module để sử dụng ở file khác
