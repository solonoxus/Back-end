const createFastify = require('./config/fastify');
const connectDB = require('./config/database');
const connectDB = require('./config/environment');
const { connect } = require('mongoose');

const fastify = createFastifyapp();

connectDatabase();

// Đăng ký routes
app.register(require('./routes/homeRoutes'), { prefix: '/' });
app.register(require('./routes/userRoutes'), { prefix: '/user' });
app.register(require('./routes/cartRoutes'), { prefix: '/cart' });
app.register(require('./routes/contactRoutes'), { prefix: '/contact' });
app.register(require('./routes/adminRoutes'), { prefix: '/admin' });
app.register(require('./routes/productsRoutes'), { prefix: '/products' });