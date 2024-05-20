import mongoose from "mongoose";

const { Schema } = mongoose;

const TableSchema = new Schema(
  {
    _id: { type: Number },
    UserID: {
      type: String,
    },
    fullname: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    default:{
        type: String,
    }
  },
  {
    timestamps: true,
  }
);

TableSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Define Counter model only if it doesn't exist
    if (!mongoose.models.Counter) {
      const counterSchema = new Schema({
        model: { type: String, required: true },
        field: { type: String, required: true },
        count: { type: Number, default: 0 },
      });

      mongoose.model("Counter", counterSchema);
    }

    const Counter = mongoose.model("Counter");

    const counter = await Counter.findOneAndUpdate(
      { model: "Address", field: "_id" },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    this._id = counter.count;
    next();
  } catch (error) {
    return next(error);
  }
});
export default mongoose.models.Address ||
  mongoose.model("Address", TableSchema);
