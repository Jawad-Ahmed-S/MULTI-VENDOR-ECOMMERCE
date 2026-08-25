import express from "express"
import { createUser, getWishlist, handleActivation, loginUser, toggleWishlist } from "../controllers/user.controller.js"
import { uploadSingle } from "../middleware/multer.js"
import {isAuthenticated} from "../middleware/auth.js"
const router = express.Router()

router.route('/create').post(uploadSingle, createUser)
router.route('/login').post(loginUser)
router.route('/activation').get(handleActivation)
router.route('/wishlist').get(isAuthenticated,getWishlist)
router.route('/wishlist/:productId').post(isAuthenticated,toggleWishlist)
router.route('/activation').get(handleActivation)

export default router;