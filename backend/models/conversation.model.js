import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
    {
        buyer: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        seller: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Store"
        },
        lastMessage: {
            text: {type:String},
            sender: { type: mongoose.Schema.Types.ObjectId },
            sentAt:{type:Date}
        },
        unreadCount: {
            buyer: { type: Number, default: 0 },
            seller: { type: Number, default: 0 },
        }
    },{timestamps:true}
)

conversationSchema.index({ buyer: 1, seller: 1 }, { unique: true });
const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation; 