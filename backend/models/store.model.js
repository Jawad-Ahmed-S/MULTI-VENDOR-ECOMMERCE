import mongoose from "mongoose"

const storeSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
        type: String,
        required: [true,'Please Enter product name']
    },
    description: {
        type: String,
        required: [true,'Please Enter product description']
    },
    banner: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    phone: {
      type: String,
    },

    email: {
      type: String,
    },

    address: {
      country: String,
      city: String,
      address: String,
      zipCode: String,
    },ratings: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
    },
    rejectionReason: String,
    totalReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    }
}, { timestamps: true })

storeSchema.index({ owner: 1 });
storeSchema.index({ approvalStatus: 1, isActive: 1 });
const Store = mongoose.model("Store", storeSchema);
export default Store

