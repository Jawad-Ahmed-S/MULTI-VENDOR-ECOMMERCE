import express from "express";
import {
  isAuthenticated,
  isSeller,
  isAdmin,
} from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getStoreOrders,
  getSellerAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAllOrdersAdmin,
} from "../controllers/order.controller.js";

const router = express.Router();


router.use(isAuthenticated);


router.post("/", createOrder);
router.get("/me", getMyOrders);
router.get("/:orderId", getOrderDetails);
router.delete("/:orderId", deleteOrder);


router.get("/seller/orders", isSeller, getSellerAllOrders);
router.get("/store/:storeId", isSeller, getStoreOrders);
router.put("/:orderId/status", isSeller, updateOrderStatus);


router.get("/admin/all", isAdmin, getAllOrdersAdmin);

export default router;