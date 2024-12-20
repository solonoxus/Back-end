class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Các lỗi thường gặp
const Errors = {
  NotFound: (message = 'Không tìm thấy tài nguyên') => 
    new AppError(404, message),
    
  Unauthorized: (message = 'Không được phép truy cập') => 
    new AppError(401, message),
    
  BadRequest: (message = 'Yêu cầu không hợp lệ') => 
    new AppError(400, message),
    
  Forbidden: (message = 'Không có quyền thực hiện') => 
    new AppError(403, message),
    
  ServerError: (message = 'Lỗi máy chủ') => 
    new AppError(500, message)
};

// Middleware xử lý lỗi
const errorHandler = (error, request, reply) => {
  console.error('Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return reply.status(400).send({
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return reply.status(400).send({
      message: `${field} đã tồn tại`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      message: 'Token không hợp lệ'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      message: 'Token đã hết hạn'
    });
  }

  // Custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message
    });
  }

  // Default error
  console.error('Unhandled error:', error);
  return reply.status(500).send({
    message: 'Lỗi hệ thống'
  });
};

module.exports = {
  AppError,
  Errors,
  errorHandler
};