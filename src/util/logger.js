const logger = {
  log: console.log,
  error: console.error
};

module.exports = logger;

module.exports = {
  mutipleMongooseToObject: function (mongooses) {
    return mongooses.map((mongoose) => mongoose.toObject());
  },
  mongooseToObject: function (mongoose) {
    return mongoose ? mongoose.toObject() : mongoose;
  },
};