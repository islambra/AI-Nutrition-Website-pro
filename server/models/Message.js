import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true }
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
