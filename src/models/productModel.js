const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    masp: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    star: {
      type: Number,
      default: 0
    },
    rateCount: {
      type: Number,
      default: 0
    },
    promo: {
      name: String,
      value: Number
    },
    detail: {
      screen: String,
      os: String,
      camara: String,
      camaraFront: String,
      cpu: String,
      ram: String,
      rom: String,
      microUSB: String,
      battery: String
    },
    stock: {
      type: Number,
      default: 0
    },
    category: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
