const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
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
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Cart", cartSchema);
