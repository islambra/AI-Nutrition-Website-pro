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

const blogRouter = express.Router();

// ==================== PUBLIC ROUTES (No authentication required) ====================
// Get all blogs
blogRouter.get("/blogs", getAllBlogs);

// Get single blog by ID
blogRouter.get("/blogs/:id", getBlogById);

// Get blogs by author ID
blogRouter.get("/blogs/author/:authorId", getBlogsByAuthor);

// Get comments for a blog
blogRouter.get("/blogs/:id/comments", getComments);

// ==================== PROTECTED ROUTES (Authentication required) ====================
// Blog CRUD operations
blogRouter.post("/blogs", protect, upload.single("image"), createBlog);
blogRouter.put("/blogs/:id", protect, upload.single("image"), updateBlog);
blogRouter.delete("/blogs/:id", protect, deleteBlog);
blogRouter.get("/blogs/my/blogs", protect, getMyBlogs);

// Comment operations
blogRouter.post("/blogs/:id/comments", protect, addComment);
blogRouter.delete("/blogs/:id/comments/:commentId", protect, deleteComment);

// Like operations
blogRouter.post("/blogs/:id/like", protect, likeBlog);
blogRouter.delete("/blogs/:id/like", protect, unlikeBlog);
blogRouter.get("/blogs/:id/like/status", protect, getLikeStatus);

export default blogRouter;