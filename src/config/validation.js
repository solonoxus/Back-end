const Joi = require('joi');

const schemas = {
  // User schemas
  userRegister: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    address: Joi.string()
  }),

  userLogin: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    name: Joi.string(),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    address: Joi.string()
  }).min(1),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  // Product schemas
  product: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string()),
    category: Joi.string().required(),
    brand: Joi.string().required()
  }),

  productQuery: Joi.object({
    search: Joi.string(),
    category: Joi.string(),
    brand: Joi.string(),
    sort: Joi.string().valid('createdAt', 'price', 'name'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(50)
  }),

  // Cart schemas
  cartAdd: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required()
  }),

  cartUpdate: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required()
  }),

  // Order schemas
  order: Joi.object({
    shippingAddress: Joi.string().required(),
    paymentMethod: Joi.string().valid('cod', 'banking').required(),
    note: Joi.string()
  }),

  orderStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'shipping', 'completed', 'cancelled')
      .required()
  }),

  // Contact schemas
  contact: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    message: Joi.string().required()
  })
};

// Middleware validation
const validate = (schema, source = 'body') => {
  return (request, reply, done) => {
    const dataToValidate = source === 'body' ? request.body : request.query;
    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });
    
    if (error) {
      return reply.status(400).send({
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    done();
  };
};

module.exports = {
  schemas,
  validate
};
