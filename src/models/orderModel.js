const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    products: [
      {
        masp: String,
        soluong: Number,
        date: { type: Date, default: Date.now }
      }
    ],
    ngaymua: {
      type: Date,
      default: Date.now
    },
    tinhTrang: {
      type: String,
      default: "Đang chờ xử lý"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);
