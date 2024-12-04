const UserServices = require("../../services/userServices");
const sell = require('../models/userModel');
const { mongooseToObject } = require("../../util/logger");

class UserController {
  constructor() {
    this.userServices = UserServices;
  }
  async renderHome(req, reply) {
    try {
      const courses = []; // Giả sử đây là dữ liệu bạn muốn hiển thị
       return reply.view("home", { courses }); // Render view home.pug với dữ liệu
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Error rendering home", message: err.message });
    }
  }
  // Lấy tất cả người dùng
  async getAllUsers(req, reply) {
    try {
      const users = await this.userServices.getAllUsers();
      return reply.view("user/index", { users });
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Error fetching users", message: err.message });
    }
  }

  // Lấy thông tin người dùng theo ID
  async getUserById(req, reply) {
    try {
      const { id } = req.params; // Thay đổi 'getUserId' thành 'getUserById'
      const user = await this.userServices.getUserById(id); // Đảm bảo hàm trong service đúng tên
      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      } else {
        return reply.view("user/profile", { user });
      }
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Error fetching user", message: err.message });
    }
  }

  // Thêm người dùng mới
  async addUser(req, reply) {
    try {
      const userData = req.body;
      const user = await this.userServices.createUser(userData); // Đảm bảo hàm đúng tên
      return reply.code(201).send(user); // Trả về mã 201 khi tạo thành công
    } catch (err) {
      return reply
        .code(500)
        .send({ error: "Error creating user", message: err.message });
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(req, reply) {
    try {
      const user = await this.userServices.updateUser(req.params.id, req.body);
      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      } else {
        return reply.view("user", { user });
      }
    } catch (err) {
      return reply
        .code(500)
        .send({ error: "Error updating user", message: err.message });
    }
  }

  // Xóa người dùng
  async deleteUser(req, reply) {
    try {
      const result = await this.userServices.deleteUser(req.params.id);
      if (!result) {
        return reply.code(404).send({ error: "User not found" });
      } else {
        reply.send({ message: "User deleted successfully" });
      }
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Error deleting user", message: err.message });
    }
  }

  // Đăng nhập người dùng
  async loginUser(req, reply) {
    try {
      const { email, password } = req.body;
      const result = await this.userServices.loginUser(email, password);
      if (!result) {
        reply.code(401).send({ error: "Invalid credentials" });
      } else {
        reply.code(200).send(result); // Trả về token và thông tin người dùng
      }
    } catch (err) {
      reply.code(500).send({ error: "Login failed", message: err.message });
    }
  }
  // Thêm hàm renderDashboard
  async renderDashboard(req, reply) {
    try {
      // Tại đây, bạn có thể làm những công việc cần thiết cho dashboard,
      // chẳng hạn như lấy dữ liệu người dùng, thống kê, v.v.
      // Ví dụ:
      const user = req.user; // Lấy thông tin user từ middleware auth
      return reply.view("dashboard", { user }); // Render trang dashboard với thông tin người dùng
    } catch (err) {
      return reply.code(500).send({ error: "Error rendering dashboard" });
    }
  }
  async showHome(req, reply) {
    const courses = await this.getCourses();
    return reply.view("home", { courses });
  }

  // Trang tạo khóa học
  async showCreateCourse(req, reply) {
    return reply.view("courses/create");
  }

  // Trang sửa khóa học
  async showEditCourse(req, reply) {
    const courseId = req.params.id;
    const course = await this.getCourseById(courseId);
    return reply.view("courses/edit", { course });
  }

  // Trang hiển thị chi tiết khóa học
  async showCourseDetail(req, reply) {
    const courseId = req.params.id;
    const course = await this.getCourseById(courseId);
    return reply.view("courses/show", { course });
  }

  // Trang lưu khóa học
  async showStoredCourses(req, reply) {
    const courses = await this.getStoredCourses();
    return reply.view("me/stored-courses", { courses });
  }

  // Trang khóa học đã xóa
  async showTrashCourses(req, reply) {
    const courses = await this.getTrashCourses();
    return reply.view("me/trash-courses", { courses });
  }

  // Lấy danh sách khóa học từ cơ sở dữ liệu (giả lập)
  async getCourses() {
    return [
      {
        name: "Course A",
        slug: "course-a",
        description: "Description A",
        image: "image-a.jpg"
      },
      {
        name: "Course B",
        slug: "course-b",
        description: "Description B",
        image: "image-b.jpg"
      }
    ];
  }

  async getCourseById(id) {
    return {
      name: "Course A",
      slug: "course-a",
      description: "Description A",
      videoId: "abc123"
    };
  }

  async getStoredCourses() {
    return [
      { name: "Stored Course A", level: "Beginner", createdAt: "2023-01-01" },
      {
        name: "Stored Course B",
        level: "Intermediate",
        createdAt: "2023-02-01"
      }
    ];
  }

  async getTrashCourses() {
    return [
      { name: "Deleted Course A", level: "Beginner", deletedAt: "2023-01-15" }
    ];
  }
}

module.exports = new UserController();
