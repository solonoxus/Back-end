const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true },
  star: { type: Number, required: true },
  rateCount: { type: Number, required: true },
  promo: {
    name: {
      type: String,
      enum: ["tragop", "giamgia", "giareonline", "moiramat"]
    },
    value: { type: String }
  },
  detail: {
    screen: { type: String },
    os: { type: String },
    camara: { type: String },
    camaraFront: { type: String },
    cpu: { type: String },
    ram: { type: String },
    rom: { type: String },
    microUSB: { type: String },
    battery: { type: String }
  }
});

module.exports = mongoose.model("Product", productSchema);
