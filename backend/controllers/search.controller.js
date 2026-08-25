import Product from "../models/product.model.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { searchPipeline } from "../utils/searchPipeline.js";

export const getCombinedResults = catchAsyncError(async (req, res, next) => {
    console.log("in controller")
    const pipeline = searchPipeline(req.query);
    const results = await Product.aggregate(pipeline);

    return res.status(200).json({
        success:true,message:"results are there!",data:results,page:req.query.page ||1,limit:req.query.limit ||10
    })
})

