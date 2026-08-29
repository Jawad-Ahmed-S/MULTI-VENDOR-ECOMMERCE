import express from "express";
import { isSeller,isAuthenticated} from "../middleware/auth.js";
import {
  createEvent,
  getStoreEvents,
  getActiveEvents,
  deactivateEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post("/create",isAuthenticated, isSeller, createEvent);
router.get("/store/:storeId",isAuthenticated, isSeller, getStoreEvents);
router.get("/active", getActiveEvents);
router.put("/:id",isAuthenticated, isSeller, updateEvent);
router.put("/:id/deactivate",isAuthenticated, isSeller, deactivateEvent);
router.delete("/:id",isAuthenticated, isSeller, deleteEvent);

export default router;