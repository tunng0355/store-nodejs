const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ListTypeSchema = new Schema(
  {
    type: { type: String },   
     main: { type: String },
     value: { type: String },
  },
  { _id: false }
);

const Table = new Schema(
  {
    UserID: {
      type: String,
    },
    productID: {
      type: String,
    },
    name: {
      type: String,
    },
    prices: {
      type: String,
    },
    quantity:  {
      type: String,
    },
    discount: {
      type: String,
    },
    TypeDiscount: {
      type: String,
    },
    total: {
      type: String,
    },
    items: {
      type: [ListTypeSchema],
      default: [],
    },
    address: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", Table);
