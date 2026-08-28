import { catchAsyncError } from "../utils/catchAsyncError.js" 
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js"

export const createMessage = catchAsyncError(async (req, res, next) => {
    const { conversationId, sender, isSeller, text } = req.body;
    
    const message = await Message.create({
    conversation: conversationId,
    sender,
    isSeller,
    text,
    });
    
    const updateField = isSeller ? "unreadCount.buyer" : "unreadCount.seller";

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: { text, sender, sentAt: message.createdAt },
    $inc: { [updateField]: 1 },
  });

  res.status(201).json({ success: true, message:"message created Sucessfully!",data:message });
})


export const getMessagesByConversation = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 30 } = req.query;

  const messages = await Message.find({
    conversation: req.params.conversationId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 }) // newest first for pagination...
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    messages: messages.reverse(), // ...then flip back to oldest-first for display
  });
});


export const softDeleteMessage = catchAsyncError(async (req, res, next) => {
  const { senderId } = req.body;

  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }

  if (message.sender.toString() !== senderId) {
    return next(new ErrorHandler("You can only delete your own messages", 403));
  }

  message.isDeleted = true;
  message.text = "This message was deleted";
  await message.save();

  res.status(200).json({
    success: true,
    message,
  });
});