import { configDotenv } from "dotenv";
import express, { urlencoded } from "express"
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js"
import storeRouter from "./routes/store.route.js"
import productRouter from "./routes/product.route.js"
import searchRouter from "./routes/search.route.js"
import orderRouter from "./routes/order.route.js"
import cartRouter from "./routes/cart.route.js"
import paymentRouter from "./routes/payment.route.js"
import messageRouter from "./routes/message.route.js"
import conversationRouter from "./routes/conversation.route.js"
import eventRouter from "./routes/event.route.js"

import { stripeWebhook } from "./controllers/payment.controller.js";
import cors from "cors"
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";


const app = express();
configDotenv();
app.use(cors());



mongoose.connect(process.env.MONGODB_URI).then(
    () => {
        console.log("Mongodb connected!");
    }
).catch((err) => { console.log(err) });




app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
    stripeWebhook(req, res, next);
  });



app.use(express.json());
app.use(urlencoded())



app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/store",storeRouter)
app.use("/api/v1/search",searchRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/message",messageRouter)
app.use("/api/v1/conversation",conversationRouter)
app.use("/api/v1/event",eventRouter)


app.use(errorHandlerMiddleware)


app.listen(8000, () => {
    console.log("Server Started!");
})