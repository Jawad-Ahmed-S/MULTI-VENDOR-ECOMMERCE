import express from "express"
import { getCombinedResults } from "../controllers/search.controller.js";


const router = express.Router();


router.route("/").get(getCombinedResults);

export default router;