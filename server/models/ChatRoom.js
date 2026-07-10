import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["client", "student", "dieteticien", "admin"], required: true }
  }],
  type: { type: String, enum: ["plan", "formation", "dieteticien"], required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
  formation: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", default: null },
  dieteticienSubscription: { type: mongoose.Schema.Types.ObjectId, ref: "DieteticienSubscription", default: null },
  lastMessage: {
    content: { type: String, default: "" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    timestamp: { type: Date, default: null }
  }
}, { timestamps: true });

chatRoomSchema.index({ "participants.user": 1 });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
