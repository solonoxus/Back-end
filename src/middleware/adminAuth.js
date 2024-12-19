async function adminAuth(request, reply) {
    try {
      // Kiểm tra xem user có quyền admin không
      if (!request.user || !request.user.isAdmin) {
        throw new Error('Không có quyền truy cập');
      }
    } catch (error) {
      reply.status(403).send({ 
        success: false,
        message: error.message || 'Không có quyền truy cập'
      });
    }
  }
  
  module.exports = adminAuth;