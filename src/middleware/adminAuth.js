const { AppError } = require('../config/errorHandler');

async function adminAuth(request, reply, next) {
  try {
    // Kiểm tra xem user có quyền admin không
    if (!request.user || !request.user.isAdmin) {
      throw new AppError(403, 'Không có quyền truy cập');
    }

    // Kiểm tra tài khoản có active không
    if (!request.user.isActive) {
      throw new AppError(403, 'Tài khoản đã bị khóa');
    }

    await next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(403, 'Không có quyền truy cập');
  }
}
  
module.exports = adminAuth;