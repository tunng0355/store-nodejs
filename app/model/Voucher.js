const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Table = new Schema(
  {
    code: {
      type: String,
    },
    price: {
      type: String,
    },
    total: {
      type: String,
    },
    used: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", Table);
