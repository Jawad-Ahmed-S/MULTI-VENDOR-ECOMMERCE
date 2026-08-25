import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name!."]
    },
    email: {
        type: String,
        required: [true, "Please enter your email!."]
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,              
        required: [true, "Please enter your password!"],
        select: false
    },
    address: [
        {
            country: { type: String },
            city: { type: String },
            address: { type: String },
            zipCode: { type: String },
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
    cart: [    
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required:true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min:1
            }
        }
    ],
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    resetPasswordToken: String,
    resetPasswordTime: Date
}, { timestamps: true })


userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
const User = mongoose.model("User", userSchema);
export default User;