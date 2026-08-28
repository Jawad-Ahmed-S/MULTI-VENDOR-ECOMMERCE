
import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createMessage,
  getMessagesByConversation,
  softDeleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, createMessage);
router.get("/:conversationId", isAuthenticated, getMessagesByConversation);
router.put("/:id/delete", isAuthenticated, softDeleteMessage);

export default router;