import {catchAsyncError} from "../utils/catchAsyncError.js"
import Stripe from "stripe"
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const { shippingAddress } = req.body;

    
  const user = await User.findById(req.user.id).populate("cart.product");

  if (!user || user.cart.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty" });
  }

    
  const lineItems = user.cart.map((item) => {
    const prod = item.product;
    const unitPrice = prod.discountPrice || prod.originalPrice;

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: prod.name,
          images: prod.images?.[0]?.url ? [prod.images[0].url] : [], // Array of URLs
        },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: item.quantity, // Quantity from cart item
    };
  }); 

  let itemsPrice = 0;
  user.cart.forEach((item) => {
    const prod = item.product;
    if (prod) {
      const price = prod.discountPrice || prod.originalPrice;
      itemsPrice += price * item.quantity;
    }
  });

  const shippingPrice = itemsPrice > 1000 ? 0 : 150;
  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping Fee",
        },
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    });
  }

    
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: user.email,
    client_reference_id: user._id.toString(),
    metadata: {
      shippingAddress: JSON.stringify(shippingAddress),
    },
    success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
  });

  res.status(200).json({ success: true, url: session.url });
});


//hook

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    
    console.error(`Webhook Signature Error: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;

    try {
      const shippingAddress = JSON.parse(session.metadata.shippingAddress);
      const user = await User.findById(userId).populate("cart.product");

      if (user && user.cart.length > 0) {
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

        const shippingFee = itemsPrice > 1000 ? 0 : 150;

        await Order.create({
          user: user._id,
          orderItems,
          shippingAddress,
          itemsPrice,
          shippingPrice: shippingFee,
          totalPrice: itemsPrice + shippingFee,
          paymentInfo: {
            id: session.payment_intent || session.id,
            method: "Stripe",
            status: "paid",
            paidAt: Date.now(),
          },
        });

        user.cart = [];
        await user.save();
      }
    } catch (dbError) {
      console.error("Failed to save order from webhook:", dbError);
      return res.status(500).json({ success: false, message: "Database Error" });
    }
  }

  // Stripe expects 200 OK to acknowledge receipt
  res.status(200).json({ success: true, message: "Order Placed Successfully!", received: true });
};

// Called by the frontend success page to check what actually happened,
// instead of assuming success just because Stripe redirected here.
export const verifyCheckoutSession = catchAsyncError(async (req, res, next) => {
  const { sessionId } = req.params;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    return res.status(404).json({ success: false, status: "not_found", message: "We couldn't find that checkout session." });
  }

  // Make sure this session actually belongs to the logged-in user
  if (session.client_reference_id !== req.user.id.toString()) {
    return res.status(403).json({ success: false, status: "forbidden", message: "This session doesn't belong to your account." });
  }

  if (session.payment_status !== "paid") {
    return res.status(200).json({
      success: false,
      status: session.status === "expired" ? "expired" : "failed",
      message: "Payment was not completed.",
    });
  }

  // Payment succeeded on Stripe's side. Now check whether our webhook
  // has finished creating the Order yet (it runs async, slightly after
  // the browser redirect, so it may not exist the instant this runs).
  const paymentIntentId = session.payment_intent || session.id;
  const order = await Order.findOne({ "paymentInfo.id": paymentIntentId });

  if (!order) {
    return res.status(200).json({ success: true, status: "processing" });
  }

  return res.status(200).json({ success: true, status: "success", order });
});