const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Table = new Schema(
  {
    logo: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    keyword: {
      type: String,
    },
    hotline: {
      type: String,
    },
    vat: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setting", Table);
