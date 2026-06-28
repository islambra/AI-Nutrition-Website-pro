// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { 
  timestamps: true 
});

commentSchema.index({ blog: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;