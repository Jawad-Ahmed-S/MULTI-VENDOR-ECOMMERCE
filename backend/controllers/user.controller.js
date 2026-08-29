import User from "../models/user.model.js";
import Store from "../models/store.model.js";
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
    const { token } = req.query;

    let newUser;
    try {
        newUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/activation-failed`);
    }

    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });
    if (user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }

    user = await User.create({ name, email, password, avatar });

    const jwtToken = user.getJWTToken(); // same method sendToken uses

    
    return res.redirect(`${process.env.FRONTEND_URL}/activation-success#token=${jwtToken}`);
});


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

// =====================================================
// ADMIN CONTROLLERS - USER MANAGEMENT
// =====================================================
// Split: "users" = role "user" (plain customers)
//        "sellers" = role "seller" (may or may not have created a store yet)
//        "owners" = role "seller" users who own at least one Store, store(s) attached

// Admin: Get all plain users (customers)
export const adminGetAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find({ role: "user" }).select("-password");

    return res.status(200).json({
        success: true,
        message: "Users Fetched!",
        data: users,
    });
});

// Admin: Get all sellers (role = "seller"), each with their store(s) attached.
// A seller who hasn't created a store yet is still returned, just with stores: [].
// (Replaces the old separate "sellers" / "owners" split — every seller is a
// potential owner, so there's no meaningful distinction to show separately.)
export const adminGetAllSellers = catchAsyncError(async (req, res, next) => {

    const sellers = await User.find({ role: "seller" }).select("-password");

    const stores = await Store.find({
        owner: { $in: sellers.map((seller) => seller._id) },
    });

    const storesByOwner = new Map();
    stores.forEach((store) => {
        const ownerId = store.owner.toString();
        if (!storesByOwner.has(ownerId)) storesByOwner.set(ownerId, []);
        storesByOwner.get(ownerId).push({
            _id: store._id,
            name: store.name,
            approvalStatus: store.approvalStatus,
            isActive: store.isActive,
        });
    });

    const sellersWithStores = sellers.map((seller) => ({
        ...seller.toObject(),
        stores: storesByOwner.get(seller._id.toString()) || [],
    }));

    return res.status(200).json({
        success: true,
        message: "Sellers Fetched!",
        data: sellersWithStores,
    });
});

// Admin: Get a single user's full details, regardless of role
export const adminGetUser = catchAsyncError(async (req, res, next) => {

    const { userId } = req.params;

    if (!userId) {
        return next(new errorHandler(404, "No UserId found!"));
    }

    const user = await User.findById(userId).select("-password").populate("wishlist");

    if (!user) {
        return next(new errorHandler(404, "No User found for this Id!"));
    }

    const stores = await Store.find({ owner: userId });

    return res.status(200).json({
        success: true,
        message: "User Fetched!",
        data: { ...user.toObject(), stores },
    });
});

// Admin: Update any user's details/role directly
export const adminUpdateUser = catchAsyncError(async (req, res, next) => {

    const { userId } = req.params;

    if (!userId) {
        return next(new errorHandler(404, "No UserId found!"));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new errorHandler(404, "No User found for this Id!"));
    }

    const { name, email, phone, role } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;

    await user.save();

    return res.status(200).json({
        success: true,
        message: "User Updated by Admin!",
        data: user,
    });
});

// Admin: Force delete any user from the system
export const adminDeleteUser = catchAsyncError(async (req, res, next) => {

    const { userId } = req.params;

    if (!userId) {
        return next(new errorHandler(404, "No UserId found!"));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new errorHandler(404, "No User found for this Id!"));
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
        success: true,
        message: "User Deleted by Admin!",
    });
});