// routes/blogRoutes.js
import express from "express";
import {
    createBlog,
    getAllBlogs,
    getMyBlogs,
    getBlogsByAuthor,
    getBlogById,
    updateBlog,
    deleteBlog,
    addComment,
    getComments,
    deleteComment,
    likeBlog,
    unlikeBlog,
    getLikeStatus
} from "../controllers/blogControllers.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { validateBlog, validateComment } from "../middleware/validate.js";

const blogRouter = express.Router();

// ==================== PUBLIC ROUTES (No authentication required) ====================
blogRouter.get("/blogs", getAllBlogs);
blogRouter.get("/blogs/:id", getBlogById);
blogRouter.get("/blogs/author/:authorId", getBlogsByAuthor);
blogRouter.get("/blogs/:id/comments", getComments);

// ==================== PROTECTED ROUTES (Authentication required) ====================
blogRouter.post("/blogs", protect, upload.single("image"), validateBlog, createBlog);
blogRouter.put("/blogs/:id", protect, upload.single("image"), updateBlog);
blogRouter.delete("/blogs/:id", protect, deleteBlog);
blogRouter.get("/blogs/my/blogs", protect, getMyBlogs);

blogRouter.post("/blogs/:id/comments", protect, validateComment, addComment);
blogRouter.delete("/blogs/:id/comments/:commentId", protect, deleteComment);

blogRouter.post("/blogs/:id/like", protect, likeBlog);
blogRouter.delete("/blogs/:id/like", protect, unlikeBlog);
blogRouter.get("/blogs/:id/like/status", protect, getLikeStatus);

export default blogRouter;