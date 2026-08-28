import Conversation from "../models/conversation.model.js";
import Store from "../models/store.model.js"; // FIXED: Imported Store model
import { catchAsyncError } from "../utils/catchAsyncError.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createOrGetConversation = catchAsyncError(async (req, res, next) => {
  const { buyer, seller } = req.body;
  let conversation = await Conversation.findOne({ buyer, seller });

  if (!conversation) {
    conversation = await Conversation.create({ buyer, seller });
  }

  conversation = await conversation.populate([
    { path: "buyer", select: "name avatar" },
    {
      path: "seller",
      select: "name banner owner",
      populate: { path: "owner", select: "name avatar" },
    },
  ]);

  res.status(200).json({ success: true, message: "Conversation created!", data: conversation });
}); 

export const getBuyerConversations = catchAsyncError(async (req, res, next) => {
  const conversations = await Conversation.find({ buyer: req.params.buyerId })
    .populate("buyer", "name avatar")
    // FIXED: Nested populate to get the Store AND its Owner
    .populate({
        path: "seller", 
        select: "name banner owner", // Store details
        populate: {
            path: "owner", // The actual user who owns the store
            select: "name avatar"
        }
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, conversations });
});

export const getSellerConversations = catchAsyncError(async (req, res, next) => {
  // Fallback to check req.user._id, req.user.id, or req.params.sellerId
  const sellerId = req.user?._id || req.user?.id || req.params.sellerId;

  // 1. Find all stores owned by this user
  const stores = await Store.find({ owner: sellerId }).select("_id");
  const storeIds = stores.map((store) => store._id);

  console.log("--- DEBUG SELLER CONVERSATIONS ---");
  console.log("Logged-in Seller User ID:", sellerId);
  console.log("Store IDs found for this seller:", storeIds);

  // 2. Find conversations where 'seller' matches any of the store IDs
  const conversations = await Conversation.find({ seller: { $in: storeIds } })
    .populate("buyer", "name avatar")
    .populate({
      path: "seller",
      select: "name banner owner",
      populate: {
        path: "owner",
        select: "name avatar",
      },
    })
    .sort({ updatedAt: -1 });

  console.log("Conversations found:", conversations.length);
  console.log("----------------------------------");

  res.status(200).json({
    success: true,
    conversations,
  });
});

export const markConversationRead = catchAsyncError(async (req, res, next) => {
  const { isSeller } = req.body;
  const field = isSeller ? "unreadCount.seller" : "unreadCount.buyer";

  const conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    { [field]: 0 },
    { new: true }
  );

  if (!conversation) {
    return next(new errorHandler("Conversation not found", 404));
  }

  res.status(200).json({ success: true, conversation });
});