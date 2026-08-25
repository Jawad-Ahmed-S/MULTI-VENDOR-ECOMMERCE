import express from "express";
import {
    getAllStores,
    getSingleStore,
    getStoreProducts,
    createStore,
    getMyStores,
    getMyStore,
    updateStore,
    deleteStore,
    adminGetAllStores,
    adminGetSingleStore,
    approveStore,
    rejectStore,
    adminUpdateStore,
    adminDeleteStore,
    getStoreStats,
} from "../controllers/store.controller.js";

import {
    isAuthenticated,
    isSeller,
    isAdmin,
} from "../middleware/auth.js";
import { uploadSingle } from "../middleware/multer.js";

const router = express.Router();

// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

// Get all approved stores
router.route("/all").get(getAllStores);

// Get all approved products belonging to a store
router.route("/:storeId/products").get(getStoreProducts);


// ==========================================
// SELLER ROUTES
// ==========================================

// Create a new store
router.route("/create").post(isAuthenticated, isSeller,uploadSingle, createStore);

// Get all stores owned by seller
router.route("/seller/my").get(isAuthenticated, isSeller, getMyStores);

// Get store statistics
router.route("/seller/:storeId/stats").get(isAuthenticated, isSeller, getStoreStats);

// Operations on specific seller-owned store
router.route("/seller/my/:storeId")
    .get(isAuthenticated, isSeller, getMyStore)
    .put(isAuthenticated, isSeller,uploadSingle, updateStore)
    .delete(isAuthenticated, isSeller, deleteStore);


// ==========================================
// ADMIN ROUTES
// ==========================================

router.route("/admin/all").get(isAuthenticated,isAdmin, adminGetAllStores);

router.route("/admin/:storeId/approve").put(isAuthenticated, isAdmin, approveStore);

router.route("/admin/:storeId/reject").put(isAuthenticated, isAdmin, rejectStore);

router.route("/admin/:storeId")
    .get(isAuthenticated, isAdmin, adminGetSingleStore)
    .put(isAuthenticated, isAdmin, adminUpdateStore)
    .delete(isAuthenticated, isAdmin, adminDeleteStore);


// ==========================================
// PARAMETERIZED PUBLIC ROUTE
// (Placed at bottom to prevent route collisions)
// ==========================================

// Get single approved store details
router.route("/:storeId").get(getSingleStore);

export default router;