import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["running", "ended"],
      default: "running",
    },
  },
  { timestamps: true }
);

eventSchema.index({ store: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;