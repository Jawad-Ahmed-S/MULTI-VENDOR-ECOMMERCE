import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"; 
import Store from "../models/store.model.js"; 
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { errorHandler } from "../utils/errorHandler.js";

// 1. Get Single Order Details
export const getOrderDetails = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("orderItems.store", "name banner");

  if (!order) {
    return next(new errorHandler(404, "Order Not Found!"));
  }

  res.status(200).json({ success: true, message: "Order Fetched!", data: order });
});

// 2. Get Buyer Orders
export const getMyOrders = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Orders Fetched!", data: orders });
});

// 3. Get Store Orders (Seller)
export const getStoreOrders = catchAsyncError(async (req, res, next) => {
  const storeId = req.params.storeId;
  const orders = await Order.find({ "orderItems.store": storeId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Orders Fetched!", data: orders });
});

// 4. Cancel / Delete Order
export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new errorHandler(404, "Order Not Found!"));
  }

  const allowedStatuses = ["processing", "confirmed"];
  if (!allowedStatuses.includes(order.orderStatus)) {
    return next(
      new errorHandler(
        400,
        `Order cannot be cancelled now as its status is ${order.orderStatus}`
      )
    );
  }

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.deleteOne();
  res.status(200).json({
    success: true,
    message: "Order cancelled successfully!",
    data: order,
  });
});

// 5. Create Order from User Cart
export const createOrder = catchAsyncError(async (req, res, next) => {
  const { shippingAddress, paymentMethod = "COD" } = req.body;

  const user = await User.findById(req.user.id).populate("cart.product");

  if (!user || user.cart.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty" });
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of user.cart) {
    const prod = item.product;
    if (!prod) continue;

    const unitPrice = prod.discountPrice || prod.originalPrice;
    itemsPrice += unitPrice * item.quantity;

    orderItems.push({
      product: prod._id,
      store: prod.store,
      name: prod.name,
      image: prod.images?.[0]?.url || "",
      price: unitPrice,
      quantity: item.quantity,
    });

    await Product.findByIdAndUpdate(prod._id, {
      $inc: { stock: -item.quantity },
    });
  }

  const shippingPrice = itemsPrice > 1000 ? 0 : 150;
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: user._id,
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentInfo: {
      method: paymentMethod,
      status: paymentMethod === "Stripe" ? "paid" : "pending",
    },
  });

  user.cart = [];
  await user.save();

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    data: order,
  });
});

// 6. Update Order Status (Seller / Admin)
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { status, paymentStatus } = req.body;
  const orderId = req.params.orderId;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new errorHandler(404, "Order Not Found!"));
  }
  if (order.orderStatus === "delivered" && status === "cancelled") {
    return next(new errorHandler(400, "Cannot cancel an already delivered order!"));
  }

  
  if (status) {
    order.orderStatus = status;

    
    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = Date.now();
    }

    if (status === "delivered") {
      
      if (!order.deliveredAt) {
        order.deliveredAt = Date.now();
      }

      
      if (order.paymentInfo.method === "COD" && order.paymentInfo.status !== "paid") {
        order.paymentInfo.status = "paid";
        order.paymentInfo.paidAt = Date.now();
      }
    }
  }
  
  if (paymentStatus) {
    order.paymentInfo.status = paymentStatus;

    if (paymentStatus === "paid" && !order.paymentInfo.paidAt) {
      order.paymentInfo.paidAt = Date.now();
    }
    
    if (paymentStatus !== "paid") {
      order.paymentInfo.paidAt = undefined; 
    }
  }

  if (status === "cancelled") {
        for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
   }


  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated successfully!",
    data: order,
  });
});

export const getSellerAllOrders = catchAsyncError(async (req, res, next) => {
  
  const sellerStores = await Store.find({ owner: req.user.id }).select("_id");
  const storeIds = sellerStores.map((store) => store._id);

  if (storeIds.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No stores found for this seller",
      count: 0,
      data: [],
    });
  }

  // 2. Query orders containing items from ANY of these stores
  const orders = await Order.find({ "orderItems.store": { $in: storeIds } })
    .populate("user", "name email")
    .populate("orderItems.store", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export const getAllOrdersAdmin = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});