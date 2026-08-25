import { catchAsyncError } from "../utils/catchAsyncError.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// =====================================================
// CUSTOMER CONTROLLERS
// =====================================================

// Get all approved stores
export const getAllStores = catchAsyncError(async (req, res, next) => {

    const stores = await Store.find({
        approvalStatus: "approved",
        isActive: true,
    });

    return res.status(200).json({
        success: true,
        message: "Stores Fetched!",
        data: stores,
    });
});


// Get single approved store
export const getSingleStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findOne({
        _id: storeId,
        approvalStatus: "approved",
        isActive: true,
    });

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    return res.status(200).json({
        success: true,
        message: "Store Fetched!",
        data: store,
    });
});


// Get all approved products belonging to a store
export const getStoreProducts = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findOne({
        _id: storeId,
        approvalStatus: "approved",
        isActive: true,
    });

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    const products = await Product.find({
        store: storeId,
        approvalStatus: "approved",
    });

    return res.status(200).json({
        success: true,
        message: "Store Products Fetched!",
        data: products,
    });
});


// =====================================================
// SELLER CONTROLLERS
// =====================================================

export const createStore = catchAsyncError(async (req, res, next) => {
  const { name, description, email, phone, address } = req.body || {};

  let banner = { url: "", public_id: "" };

  if (req.file) {
    const fileSource = req.file.buffer || req.file.path;
    const result = await uploadToCloudinary(fileSource, "store_banners", {
      transformation: [{ width: 1200, height: 400, crop: "fill" }],
    });
    banner = { url: result.secure_url, public_id: result.public_id };
  }

  // Parse address if sent as JSON string from FormData
  let parsedAddress = address;
  if (typeof address === "string" && address.trim()) {
    try {
      parsedAddress = JSON.parse(address);
    } catch {
      parsedAddress = { address };
    }
  }

  const store = await Store.create({
    name,
    description,
    email,
    phone,
    banner, // Stores object { public_id, url }
    address: parsedAddress,
    owner: req.user.id || req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Store created successfully!",
    data: store,
  });
});

// Get all stores owned by logged-in seller
export const getMyStores = catchAsyncError(async (req, res, next) => {

    const userId = req.user.id;

    const stores = await Store.find({
        owner: userId,
    });

    return res.status(200).json({
        success: true,
        message: "Your Stores Fetched!",
        data: stores,
    });
});


// Get one specific store belonging to logged-in seller
export const getMyStore = catchAsyncError(async (req, res, next) => {

    const userId = req.user.id;
    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findOne({
        _id: storeId,
        owner: userId,
    });

    if (!store) {
        return next(
            new errorHandler(404, "Store not found or you do not own this store!")
        );
    }

    return res.status(200).json({
        success: true,
        message: "Your Store Fetched!",
        data: store,
    });
});


export const updateStore = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { storeId } = req.params;

  if (!storeId) {
    return next(new errorHandler(404, "No StoreId found!"));
  }

  const store = await Store.findOne({
    _id: storeId,
    owner: userId,
  });

  if (!store) {
    return next(
      new errorHandler(404, "Store not found or you do not own this store!")
    );
  }

  const { name, description, phone, email, address } = req.body || {};

  if (name !== undefined) store.name = name;
  if (description !== undefined) store.description = description;
  if (phone !== undefined) store.phone = phone;
  if (email !== undefined) store.email = email;

  if (address !== undefined) {
    if (typeof address === "string") {
      try {
        store.address = JSON.parse(address);
      } catch {
        store.address = { ...store.address, address };
      }
    } else {
      store.address = address;
    }
  }

  // Process File Upload if new banner image is provided
  if (req.file) {
    if (store.banner?.public_id) {
      await deleteFromCloudinary(store.banner.public_id);
    }

    const fileSource = req.file.buffer || req.file.path;
    const result = await uploadToCloudinary(fileSource, "store_banners", {
      transformation: [{ width: 1200, height: 400, crop: "fill" }],
    });

    store.banner = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  await store.save();

  return res.status(200).json({
    success: true,
    message: "Store Updated!",
    data: store,
  });
});

// Delete seller's own store
export const deleteStore = catchAsyncError(async (req, res, next) => {

    const userId = req.user.id;
    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findOne({
        _id: storeId,
        owner: userId,
    });

    if (!store) {
        return next(
            new errorHandler(404, "Store not found or you do not own this store!")
        );
    }

    await Store.findByIdAndDelete(storeId);

    return res.status(200).json({
        success: true,
        message: "Store Deleted!",
    });
});


// =====================================================
// ADMIN CONTROLLERS
// =====================================================


// Get all stores for admin
export const adminGetAllStores = catchAsyncError(async (req, res, next) => {

    const stores = await Store.find();

    return res.status(200).json({
        success: true,
        message: "All Stores Fetched!",
        data: stores,
    });
});


// Get any store for admin
export const adminGetSingleStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    return res.status(200).json({
        success: true,
        message: "Store Fetched!",
        data: store,
    });
});


// Approve store
export const approveStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    store.approvalStatus = "approved";
    store.rejectionReason = undefined;

    await store.save();

    return res.status(200).json({
        success: true,
        message: "Store Approved!",
        data: store,
    });
});


// Reject store
export const rejectStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;
    const { rejectionReason } = req.body;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    if (!rejectionReason) {
        return next(
            new errorHandler(400, "Please provide a rejection reason!")
        );
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    store.approvalStatus = "rejected";
    store.rejectionReason = rejectionReason;

    await store.save();

    return res.status(200).json({
        success: true,
        message: "Store Rejected!",
        data: store,
    });
});


// Admin update any store
export const adminUpdateStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    const {
        name,
        description,
        banner,
        phone,
        email,
        address,
        isActive,
    } = req.body;

    if (name !== undefined) store.name = name;
    if (description !== undefined) store.description = description;
    if (banner !== undefined) store.banner = banner;
    if (phone !== undefined) store.phone = phone;
    if (email !== undefined) store.email = email;
    if (address !== undefined) store.address = address;
    if (isActive !== undefined) store.isActive = isActive;

    await store.save();

    return res.status(200).json({
        success: true,
        message: "Store Updated by Admin!",
        data: store,
    });
});


// Admin delete any store
export const adminDeleteStore = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    await Store.findByIdAndDelete(storeId);

    return res.status(200).json({
        success: true,
        message: "Store Deleted by Admin!",
    });
});


// Get statistics for a specific store
export const getStoreStats = catchAsyncError(async (req, res, next) => {

    const { storeId } = req.params;

    if (!storeId) {
        return next(new errorHandler(404, "No StoreId found!"));
    }

    const store = await Store.findById(storeId);

    if (!store) {
        return next(
            new errorHandler(404, "No Store found for this Id!")
        );
    }

    const productStats = await Product.aggregate([
        {
            $match: {
                store: store._id,
            },
        },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalStock: { $sum: "$stock" },
            },
        },
    ]);

    const stats = productStats[0] || {
        totalProducts: 0,
        totalStock: 0,
    };

    return res.status(200).json({
        success: true,
        message: "Store Statistics Fetched!",
        data: {
            totalProducts: stats.totalProducts,
            totalStock: stats.totalStock,
            ratings: store.ratings,
            totalReviews: store.totalReviews,
        },
    });
});