import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyCheckoutSession,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);
router.get("/verify-session/:sessionId", isAuthenticated, verifyCheckoutSession);

export default router;