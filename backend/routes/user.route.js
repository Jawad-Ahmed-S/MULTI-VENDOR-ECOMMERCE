import express from "express"
import { createUser, getWishlist, handleActivation, loginUser, toggleWishlist } from "../controllers/user.controller.js"
import { uploadSingle } from "../middleware/multer.js"
import { isAuthenticated,isAdmin } from "../middleware/auth.js" 
import {
  adminGetAllUsers,
  adminGetAllSellers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../controllers/user.controller.js";

const router = express.Router()

router.route('/create').post(uploadSingle, createUser)
router.route('/login').post(loginUser)
router.route('/activation').get(handleActivation)
router.route('/wishlist').get(isAuthenticated,getWishlist)
router.route('/wishlist/:productId').post(isAuthenticated,toggleWishlist)
router.route('/activation').get(handleActivation)

router.get("/admin/users", isAuthenticated, isAdmin, adminGetAllUsers);
router.get("/admin/sellers", isAuthenticated, isAdmin, adminGetAllSellers);
router.get("/admin/:userId", isAuthenticated, isAdmin, adminGetUser);
router.put("/admin/:userId", isAuthenticated, isAdmin, adminUpdateUser);
router.delete("/admin/:userId", isAuthenticated, isAdmin, adminDeleteUser);

export default router;