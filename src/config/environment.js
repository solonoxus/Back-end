require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/',
};