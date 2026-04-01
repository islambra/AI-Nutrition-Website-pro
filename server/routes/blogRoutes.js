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
    likeBlog,
    dislikeBlog
} from "../controllers/blogControllers.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const blogRouter = express.Router();

blogRouter.get("/blogs", getAllBlogs);
blogRouter.get("/blogs/:id", getBlogById);
blogRouter.get("/blogs/author/:authorName", getBlogsByAuthor);
blogRouter.put("/blogs/:id/like", likeBlog);
blogRouter.put("/blogs/:id/dislike", dislikeBlog);

blogRouter.post("/blogs", protect, upload.single("image"), createBlog);
blogRouter.get("/blogs/my/blogs", protect, getMyBlogs);
blogRouter.post("/blogs/:id/comments", protect, addComment);
blogRouter.put("/blogs/:id", protect, upload.single("image"), updateBlog);
blogRouter.delete("/blogs/:id", protect, deleteBlog);

export default blogRouter;