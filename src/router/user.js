const { authMiddleware, validateUserInput } = require('../middlewares/auth')
const UserController = require('../app/controllers/userController')

async function routes(fastify, options) {
  // Public routes
  fastify.post('/login', UserController.loginUser)
  fastify.post('/register', validateUserInput, UserController.createUser)
  
  // Protected routes
  fastify.get('/users', { preHandler: authMiddleware }, UserController.getAllUsers)
  fastify.get('/users/:id', { preHandler: authMiddleware }, UserController.getUserById)
  fastify.put('/users/:id', { preHandler: authMiddleware }, UserController.updateUser)
  fastify.delete('/users/:id', { preHandler: authMiddleware }, UserController.deleteUser)
  fastify.get('/', UserController.renderHome);


  // Tạo khóa học
  fastify.get("/courses/create", UserController.showCreateCourse);

  // Sửa khóa học
  fastify.get("/courses/:id/edit", UserController.showEditCourse);

  // Chi tiết khóa học
  fastify.get("/courses/:id",UserController.showCourseDetail);

  // Khóa học đã lưu
  fastify.get("/me/stored/courses", UserController.showStoredCourses);

  // Khóa học đã xóa
  fastify.get("/me/trash/courses", UserController.showTrashCourses);

  // Dashboard route
  fastify.get('/dashboard', { preHandler: authMiddleware }, UserController.renderDashboard)
}

module.exports = routes