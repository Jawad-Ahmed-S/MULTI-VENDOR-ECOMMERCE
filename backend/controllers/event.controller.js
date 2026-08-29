import Event from "../models/event.model.js";
import Product from "../models/product.model.js";
import {errorHandler} from "../utils/errorHandler.js";
import {catchAsyncError} from "../utils/catchAsyncError.js";


const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  return Math.round((originalPrice * (1 - discountPercentage / 100)) * 100) / 100;
};

export const createEvent = catchAsyncError(async (req, res, next) => {
  const { productId, storeId, discountPercentage, startDate, endDate } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }

  if (product.store.toString() !== storeId) {
    return next(new errorHandler("This product does not belong to your store", 403));
  }

  // Calculate calculated discount price using product's original price
  const basePrice = product.originalPrice || product.discountPrice;
  const computedDiscountPrice = calculateDiscountedPrice(basePrice, discountPercentage);

  const event = await Event.create({
    product: productId,
    store: storeId,
    discountPercentage,
    startDate,
    endDate,
  });

  // Sync onto Product document
  await Product.findByIdAndUpdate(productId, {
    originalPrice: basePrice,
    discountPrice: computedDiscountPrice,
    saleEndsAt: endDate,
  });

  res.status(201).json({
    success: true,
    event,
  });
});

// Update Sale Event
export const updateEvent = catchAsyncError(async (req, res, next) => {
  const { discountPercentage, startDate, endDate, status } = req.body;

  let event = await Event.findById(req.params.id);
  if (!event) {
    return next(new errorHandler("Event not found", 404));
  }

  const product = await Product.findById(event.product);
  if (!product) {
    return next(new errorHandler("Associated product not found", 404));
  }

  event.discountPercentage = discountPercentage ?? event.discountPercentage;
  event.startDate = startDate ?? event.startDate;
  event.endDate = endDate ?? event.endDate;
  event.status = status ?? event.status;
  await event.save();

  // Recalculate and update product
  if (event.status === "running") {
    const computedDiscountPrice = calculateDiscountedPrice(
      product.originalPrice || product.discountPrice,
      event.discountPercentage
    );

    await Product.findByIdAndUpdate(event.product, {
      discountPrice: computedDiscountPrice,
      saleEndsAt: event.endDate,
    });
  } else {
    // If event is marked ended, revert saleEndsAt
    await Product.findByIdAndUpdate(event.product, {
      $unset: { saleEndsAt: 1 },
    });
  }

  res.status(200).json({
    success: true,
    event,
  });
});

// Deactivate Sale Event
export const deactivateEvent = catchAsyncError(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: "ended" },
    { new: true }
  );

  if (!event) {
    return next(new errorHandler("Event not found", 404));
  }

  // Clear saleEndsAt on Product
  await Product.findByIdAndUpdate(event.product, {
    $unset: { saleEndsAt: 1 },
  });

  res.status(200).json({
    success: true,
    event,
  });
});

// Delete Sale Event
export const deleteEvent = catchAsyncError(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new errorHandler("Event not found", 404));
  }

  await Product.findByIdAndUpdate(event.product, {
    $unset: { saleEndsAt: 1 },
  });

  res.status(200).json({
    success: true,
    message: "Event deleted",
  });
});
// Seller dashboard: every event this store has ever run, running or ended.
export const getStoreEvents = catchAsyncError(async (req, res, next) => {
  const events = await Event.find({ store: req.params.storeId })
    .populate("product", "name images originalPrice")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    events,
  });
});

// Public storefront: only events that are actually live right now —
// status hasn't been manually ended, AND we're inside the date window.
// This is the query that replaces needing a cron job to "expire" anything.
export const getActiveEvents = catchAsyncError(async (req, res, next) => {
  const now = new Date();

  const events = await Event.find({
    status: "running",
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate("product")
    .populate("store", "name")
    .sort({ endDate: 1 }); // soonest-ending first — nudges urgency on the storefront

  res.status(200).json({
    success: true,
    events,
  });
});

