import express from "express";
import {
    getAllProducts,
    getProduct,
    getStoreProducts,
    createProduct,
    getMyProducts,
    getMyProduct,
    updateProduct,
    deleteProduct,
    adminGetAllProducts,
    adminGetProduct,
    approveProduct,
    rejectProduct,
    adminUpdateProduct,
    adminDeleteProduct,
} from "../controllers/product.controller.js";

import {
    isAuthenticated,
    isSeller,
    isAdmin,
} from "../middleware/auth.js";
import { uploadMultiple } from "../middleware/multer.js";

const router = express.Router();

// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

// Get all approved products across the platform
router.route("/all").get(getAllProducts);

// Get all approved products belonging to a specific store
router.route("/store/:storeId").get(getStoreProducts);


// ==========================================
// SELLER ROUTES
// ==========================================

// Create product under a specific store owned by the seller
router.route("/seller/store/:storeId/create").post(isAuthenticated, isSeller,uploadMultiple, createProduct);

// Get all products owned by seller across all their stores
router.route("/seller/my").get(isAuthenticated, isSeller, getMyProducts);

// Operations on specific seller-owned product
router.route("/seller/my/:productId")
    .get(isAuthenticated, isSeller, getMyProduct)
    .put(isAuthenticated, isSeller,uploadMultiple, updateProduct)
    .delete(isAuthenticated, isSeller, deleteProduct);


// ==========================================
// ADMIN ROUTES
// ==========================================

router.route("/admin/all").get(isAuthenticated, isAdmin, adminGetAllProducts);

router.route("/admin/:productId/approve").put(isAuthenticated, isAdmin, approveProduct);

router.route("/admin/:productId/reject").put(isAuthenticated, isAdmin, rejectProduct);

router.route("/admin/:productId")
    .get(isAuthenticated, isAdmin, adminGetProduct)
    .put(isAuthenticated, isAdmin,uploadMultiple, adminUpdateProduct)
    .delete(isAuthenticated, isAdmin, adminDeleteProduct);


// ==========================================
// PARAMETERIZED PUBLIC ROUTE
// (Placed at bottom to prevent route collisions)
// ==========================================

// Get single approved product by ID
router.route("/:productId").get(getProduct);

export default router;