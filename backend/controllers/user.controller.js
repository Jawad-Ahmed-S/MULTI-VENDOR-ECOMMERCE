import User from "../models/user.model.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { errorHandler } from "../utils/errorHandler.js";
import {sendToken} from '../utils/sendToken.js'
import { uploadToCloudinary } from "../utils/cloudinary.js"; 
import jwt from "jsonwebtoken"
import {sendMail} from "../utils/sendMail.js"



export const createUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });
    if (userEmail) {
        return next(new errorHandler(400, "User Already Exist!"));
    }
    if (!req.file) {
    return next(new errorHandler(400, "Avatar image is required!"));
  }
    const result = await uploadToCloudinary(req.file.buffer, "avatar", {
        transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
    })
    const avatar = { url: result.secure_url, public_id: result.public_id }
    
    const user = {
        name,
        email,
        password,
        avatar: avatar
    }
    const activationToken = createActivationToken(user);

    const activationUrl = `${process.env.BACKEND_URL}/api/v1/user/activation?token=${activationToken}`;

    try {
        await sendMail({
            email: user.email,
            subject: "Activate your account",
            message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`
        });
        return res.status(201).json(
            {
                success: true,
                messages:`Please check your email: ${user.email}. To activate your account.`
            }
        )
    } catch (err) {
        return next(new errorHandler(500,err.message || "Email failed to send."))
    }
    
})
export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        return next(new errorHandler(404,"Email is Required!"))
    }
    if (!password) {
        return next(new errorHandler(404,"Password is Required!"))
    }

    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
        return next (new errorHandler(400,"User Not Found!"))
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return next (new errorHandler(400,"Password was Incorrect for the given email!"))
    }
    
    sendToken(user, 200, res, "User Loggedin!")    
})

export const createActivationToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn:"5m"
    })
}


export const handleActivation = catchAsyncError(async (req, res, next) => {
    const { token } = req.query
    const newUser = jwt.verify(token, process.env.JWT_SECRET);

    if (!newUser) {
        return next(new errorHandler(400,"Invalid Token!"))
    }
    
    const { name, email, password, avatar } = newUser;
    
    let user = await User.findOne({email});
    if (user) {
        return next(new errorHandler(400,"User Already Exists!"))
    }

    user = await User.create({ name, email, password, avatar });
    sendToken(user, 200, res, 'User Sucessfully Created!');
})


export const toggleWishlist = catchAsyncError(async (req, res,next) => {
  
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new errorHandler(404, "User not Found!"));
    }
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
        user.wishlist.push(productId);
    }
    
    await user.save();
    await user.populate("wishlist");
    
    res.status(200).json({
        success:true,
        message: index > -1 ? "Removed from wishlist" : "Added to wishlist",
        data: user.wishlist,
    });
    
});

// Get User Wishlist
export const getWishlist = catchAsyncError(async (req, res,next) => {
    
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) {
        return next(new errorHandler(404, "User not Found!"));
    }

    res.status(200).json({success:true,message:"WishList Fetched!", data: user.wishlist });
  
});