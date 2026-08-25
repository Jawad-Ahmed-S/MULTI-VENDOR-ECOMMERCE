import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Store"
    },
    name: {
        type: String,
        required: [true,'Please Enter product name']
    },
    description: {
        type: String,
        required: [true,'Please Enter product description']
    },
    category: {
        type: String,
        required: [true,'Please Enter product category']
    },
    tags: [{ type: String }],
    originalPrice: {
        type: Number,
    },
    discountPrice: {
        type: Number,
        required: [true, "Please enter your product price!"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter your product stock!"],
    },
    images: [
        {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        },
    ],
    reviews: [{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type:Number
        },
        comment: {
            type:String
        },
        createdAt:
        {
            type: Date,
            default:Date.now()
        }
    }
    ],
    ratings:{ type: Number },
    sold_out: { type: Number },
    approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
    },
    rejectionReason: String
}, { timestamps: true })


productSchema.index({ store: 1, approvalStatus: 1 });
const Product = mongoose.model("Product", productSchema);
export default Product