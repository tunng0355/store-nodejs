const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Table = new Schema(
  {
    name: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mark", Table);
