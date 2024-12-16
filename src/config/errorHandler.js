const { NODE_ENV } = require("./environment");

const errorTypes = {
  VALIDATION_ERROR: "ValidationError",
  AUTHENTICATION_ERROR: "AuthenticationError",
  AUTHORIZATION_ERROR: "AuthorizationError",
  NOT_FOUND_ERROR: "NotFoundError",
  DATABASE_ERROR: "DatabaseError"
};

const errorHandler = (error, request, reply) => {
  // Log error với thông tin chi tiết
  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      type: error.name,
      code: error.code,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    }
  });

  // Xử lý các loại lỗi cụ thể
  switch (error.name) {
    case errorTypes.VALIDATION_ERROR:
      return reply.status(400).send({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: NODE_ENV === "development" ? error.details : undefined
      });

    case errorTypes.AUTHENTICATION_ERROR:
      return reply.status(401).send({
        status: "error",
        code: "AUTHENTICATION_ERROR",
        message: "Xác thực không thành công"
      });

    case errorTypes.AUTHORIZATION_ERROR:
      return reply.status(403).send({
        status: "error",
        code: "AUTHORIZATION_ERROR",
        message: "Không có quyền truy cập"
      });

    case errorTypes.NOT_FOUND_ERROR:
      return reply.status(404).send({
        status: "error",
        code: "NOT_FOUND_ERROR",
        message: "Không tìm thấy tài nguyên"
      });

    case errorTypes.DATABASE_ERROR:
      return reply.status(500).send({
        status: "error",
        code: "DATABASE_ERROR",
        message: "Lỗi cơ sở dữ liệu",
        details: NODE_ENV === "development" ? error.details : undefined
      });

    default:
      // Generic error response
      return reply.status(500).send({
        status: "error",
        code: "INTERNAL_SERVER_ERROR",
        message: NODE_ENV === "development" 
          ? error.message 
          : "Đã xảy ra lỗi, vui lòng thử lại sau"
      });
  }
};

module.exports = {
  errorHandler,
  errorTypes
};