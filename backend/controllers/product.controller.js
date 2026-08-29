import { catchAsyncError } from "../utils/catchAsyncError.js";
import { errorHandler } from "../utils/errorHandler.js";
import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiClass from "../utils/apiFEatures.js";

export const getAllProducts = catchAsyncError(async (req, res, next) => {

    const apiFeatures = new ApiClass(
        Product.find({
            approvalStatus: "approved",
        })
            .populate("store", "name banner ratings")
            .select("-reviews"),
        req.query
    )
        .search()
        .filter()
        .activeSale()
        .pagination(10);

    const products = await apiFeatures.query;

    return res.status(200).json({
        success: true,
        message: "Products Fetched!",
        data: products,
    });
});

// Get a single approved product by ID
export const getProduct = catchAsyncError(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findOne({
        _id: productId,
        approvalStatus: "approved",
    }).populate("store", "name banner ratings").select("-reviews")

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    return res.status(200).json({
        success: true,
        message: "Product Fetched!",
        data: product,
    });
});

// Get all approved products belonging to a specific store
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
        return next(new errorHandler(404, "No Store found for this Id!"));
    }

    const products = await Product.find({
        store: storeId,
        approvalStatus: "approved",
    }).select("-reviews")

    return res.status(200).json({
        success: true,
        message: "Store Products Fetched!",
        data: products,
    });
});

// =====================================================
// SELLER CONTROLLERS
// =====================================================

// Create a new product for a seller's store
export const createProduct = catchAsyncError(async (req, res, next) => {
  const { storeId } = req.params;
  const { name, description, category, tags, originalPrice, discountPrice, stock } = req.body;

  let uploadedImages = [];

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "products", {
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      })
    );
    const results = await Promise.all(uploadPromises);
    uploadedImages = results.map((res) => ({
      url: res.secure_url,
      public_id: res.public_id,
    }));
  }

  const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];

  const product = await Product.create({
    store: storeId,
    name,
    description,
    category,
    tags: parsedTags,
    originalPrice: Number(originalPrice),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    stock: Number(stock),
    images: uploadedImages, 
    seller: req.user.id,
});

  res.status(201).json({
    success: true,
    message: "Product created successfully!",
    data: product,
  });
});


// Get all products owned by the logged-in seller across all their stores
export const getMyProducts = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;

    const userStores = await Store.find({ owner: userId }).select("_id");
    const storeIds = userStores.map((store) => store._id);

    const products = await Product.find({
        store: { $in: storeIds },
    });

    return res.status(200).json({
        success: true,
        message: "Your Products Fetched!",
        data: products,
    });
});

// Get a specific product belonging to the logged-in seller
export const getMyProduct = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const store = await Store.findOne({
        _id: product.store,
        owner: userId,
    });

    if (!store) {
        return next(
            new errorHandler(403, "You do not have permission to view this product!")
        );
    }

    return res.status(200).json({
        success: true,
        message: "Your Product Fetched!",
        data: product,
    });
});

// Update seller's own product
export const updateProduct = catchAsyncError(async (req, res, next) => {

    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const store = await Store.findOne({
        _id: product.store,
        owner: userId,
    });

    if (!store) {
        return next(
            new errorHandler(403, "You do not have permission to update this product!")
        );
    }

    const {
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        images,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (tags !== undefined) product.tags = tags;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (stock !== undefined) product.stock = stock;
    if (images !== undefined) product.images = images;

    await product.save();

    return res.status(200).json({
        success: true,
        message: "Product Updated!",
        data: product,
    });
});

// Delete seller's own product
export const deleteProduct = catchAsyncError(async (req, res, next) => {

    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const store = await Store.findOne({
        _id: product.store,
        owner: userId,
    });

    if (!store) {
        return next(
            new errorHandler(403, "You do not have permission to delete this product!")
        );
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
        success: true,
        message: "Product Deleted!",
    });
});

// =====================================================
// ADMIN CONTROLLERS
// =====================================================

// Admin get all products across system
export const adminGetAllProducts = catchAsyncError(async (req, res, next) => {

    const products = await Product.find().populate("store", "name");

    return res.status(200).json({
        success: true,
        message: "All Products Fetched!",
        data: products,
    });
});

// Admin get single product details
export const adminGetProduct = catchAsyncError(async (req, res, next) => {

    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId).populate("store", "name");

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    return res.status(200).json({
        success: true,
        message: "Product Fetched!",
        data: product,
    });
});

// Admin approve product for listing
export const approveProduct = catchAsyncError(async (req, res, next) => {

    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    product.approvalStatus = "approved";
    product.rejectionReason = undefined;

    await product.save();

    return res.status(200).json({
        success: true,
        message: "Product Approved!",
        data: product,
    });
});

// Admin reject product listing request
export const rejectProduct = catchAsyncError(async (req, res, next) => {

    const { productId } = req.params;
    const { rejectionReason } = req.body;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    if (!rejectionReason) {
        return next(
            new errorHandler(400, "Please provide a rejection reason!")
        );
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    product.approvalStatus = "rejected";
    product.rejectionReason = rejectionReason;

    await product.save();

    return res.status(200).json({
        success: true,
        message: "Product Rejected!",
        data: product,
    });
});

// Admin update any product details directly
export const adminUpdateProduct = catchAsyncError(async (req, res, next) => {

    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const {
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        images,
        approvalStatus,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (tags !== undefined) product.tags = tags;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (stock !== undefined) product.stock = stock;
    if (images !== undefined) product.images = images;
    if (approvalStatus !== undefined) product.approvalStatus = approvalStatus;

    await product.save();

    return res.status(200).json({
        success: true,
        message: "Product Updated by Admin!",
        data: product,
    });
});

// Admin force delete any product from system
export const adminDeleteProduct = catchAsyncError(async (req, res, next) => {

    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
        success: true,
        message: "Product Deleted by Admin!",
    });
});


const recalculateRatings = (product) => {
  if (!product.reviews || product.reviews.length === 0) {
    product.ratings = 0;
    return;
  }
  const total = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  product.ratings = total / product.reviews.length;
};

// =====================================================
// REVIEW CONTROLLERS
// =====================================================

// Get all reviews for a product (logged-in users only)
export const getProductReviews = catchAsyncError(async (req, res, next) => {
    // Defensive check — isAuthenticated middleware should already block this,
    // but we guard here in case this controller is ever reused elsewhere.
    if (!req.user) {
        return next(new errorHandler(401, "You must be logged in to view reviews!"));
    }

    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findOne({
        _id: productId,
        approvalStatus: "approved",
    }).populate("reviews.user", "name avatar");

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    return res.status(200).json({
        success: true,
        message: "Reviews Fetched!",
        data: product.reviews,
    });
});

// Add or update the logged-in user's review for a product
export const addReview = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    if (!rating || rating < 1 || rating > 5) {
        return next(new errorHandler(400, "Please provide a rating between 1 and 5!"));
    }

    const product = await Product.findOne({
        _id: productId,
        approvalStatus: "approved",
    });

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const existingReview = product.reviews.find(
        (r) => r.user.toString() === userId.toString()
    );

    if (existingReview) {
        existingReview.rating = rating;
        existingReview.comment = comment;
        existingReview.createdAt = Date.now();
    } else {
        product.reviews.push({
            user: userId,
            rating,
            comment,
            createdAt: Date.now(),
        });
    }

    recalculateRatings(product);
    await product.save();

    return res.status(200).json({
        success: true,
        message: existingReview ? "Review Updated!" : "Review Added!",
        data: product.reviews,
    });
});

// Delete the logged-in user's own review
export const deleteReview = catchAsyncError(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
        return next(new errorHandler(404, "No ProductId found!"));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new errorHandler(404, "No Product found for this Id!"));
    }

    const reviewExists = product.reviews.some(
        (r) => r.user.toString() === userId.toString()
    );

    if (!reviewExists) {
        return next(new errorHandler(404, "You have not reviewed this product!"));
    }

    product.reviews = product.reviews.filter(
        (r) => r.user.toString() !== userId.toString()
    );

    recalculateRatings(product);
    await product.save();

    return res.status(200).json({
        success: true,
        message: "Review Deleted!",
        data: product.reviews,
    });
});