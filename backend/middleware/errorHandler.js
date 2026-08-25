import { errorHandler } from "../utils/errorHandler.js";

export const errorHandlerMiddleware = (err,req,res,next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
 

  if (err.name === 'CastError') {
    err = new errorHandler(400, "Resource Not Found!");
  }
  if (err.name === '11000') {
    err = new errorHandler(400,`Duplicate ${Object.keys(err.keyValue)} Entered!.`);
  }
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Something went wrong",
  });
};