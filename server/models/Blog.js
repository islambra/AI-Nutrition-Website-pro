import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  photo: { type: String, default: null },
  type: { type: String, enum: ["Recipe", "Article", "Community"], required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ fixed
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;