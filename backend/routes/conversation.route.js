
import express from "express";
import { isAuthenticated, isSeller } from "../middleware/auth.js";
import {
  createOrGetConversation,
  getBuyerConversations,
  getSellerConversations,
  markConversationRead,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/create-or-get", isAuthenticated, createOrGetConversation);
router.get("/buyer/:buyerId", isAuthenticated, getBuyerConversations);
router.get("/seller/:sellerId",isAuthenticated, isSeller, getSellerConversations);
router.put("/:id/mark-read", isAuthenticated, markConversationRead);

export default router;