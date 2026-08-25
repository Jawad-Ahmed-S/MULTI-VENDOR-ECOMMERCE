import User from "../models/user.model.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { errorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const authheader = req.headers.authorization

    if (!authheader || !authheader.startsWith("Bearer ") ) {
        return next(new errorHandler(401,"Please Login to acess this resource"))
    }
    
    const token = authheader.split(" ")[1];
    
    if (!token) {
        return next(new errorHandler(404,"User token not found!"))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = {
        id:decodedData.id
    }

    next();
})


export const isSeller = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id
    
    const user = await User.findById(userId)
    if (user.role !== "seller") {
        return next(new errorHandler(404,"You are not Authorized for this request!"))
    }

    next();
})

export const isAdmin = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id
    
    const user = await User.findById(userId)
    if (user.role !== "admin") {
        return next(new errorHandler(404,"You are not Authorized for this request!"))
    }

    next();
})