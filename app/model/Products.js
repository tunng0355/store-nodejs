const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ThumbnailSchema = new Schema(
  {
    src: { type: String },
    alt: { type: String },
  },
  { _id: false }
);
const ListTypeSchema = new Schema(
  {
    name: { type: String },
    type: { type: String },
    data: {   
      type: [String],
      default: [],
     },
  },
  { _id: false }
);

const ProductsSchema = new Schema(
  {
    menu: {
      type: String,
    },
    mark: {
      type: String,
    },
    path: {
      type: String,
    },
    name: {
      type: String,
    },
    price: {
      type: String,
    },
    content: {
      type: String,
    },
    description: {
      type: String,
    },
    show: {
      type: String,
    },
    ListType: {
      type: [ListTypeSchema],
      default: [],
    },
    thumbnail: {
      type: [ThumbnailSchema],
      default: [],
    },
    sell: {
      type: String,
    },
    discount: {
      type: String,
    },
    TypeDiscount: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Products", ProductsSchema);
