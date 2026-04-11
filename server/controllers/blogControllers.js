// controllers/blogControllers.js
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import imagekit from "../configs/imageKit.js";

export const createBlog = async (req, res) => {
    try {
        const { type, title, content, tags } = req.body;
        
        // Get authenticated user
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        let photoUrl = null;
        
        // Upload image to ImageKit if file exists
        if (req.file) {
            try {
                const base64Image = req.file.buffer.toString('base64');
                const uploadResponse = await imagekit.upload({
                    file: base64Image,
                    fileName: `${Date.now()}-${req.file.originalname}`,
                    folder: "/blogs",
                });
                photoUrl = uploadResponse.url;
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image",
                    error: uploadError.message
                });
            }
        }

        // Create new blog
        const newBlog = new Blog({
            photo: photoUrl,
            type,
            author: user._id,
            title,
            content,
            tags: tags ? JSON.parse(tags) : []
        });

        const savedBlog = await newBlog.save();

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: savedBlog
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error creating blog", 
            error: error.message 
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { type, title, content, tags } = req.body;
        
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own blogs"
            });
        }
        
        let photoUrl = blog.photo;
        
        // Upload new image to ImageKit if file exists
        if (req.file) {
            try {
                const base64Image = req.file.buffer.toString('base64');
                const uploadResponse = await imagekit.upload({
                    file: base64Image,
                    fileName: `${Date.now()}-${req.file.originalname}`,
                    folder: "/blogs",
                });
                photoUrl = uploadResponse.url;
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image",
                    error: uploadError.message
                });
            }
        }
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { 
                photo: photoUrl,
                type, 
                title, 
                content, 
                tags: tags ? JSON.parse(tags) : blog.tags 
            },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error updating blog", 
            error: error.message 
        });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'fullName email photo')
            .sort({ createdAt: -1 });
        
        // Get likes and comments count for each blog
        const blogsWithStats = await Promise.all(blogs.map(async (blog) => {
            const likesCount = await Like.countDocuments({ blog: blog._id });
            const commentsCount = await Comment.countDocuments({ blog: blog._id });
            return {
                ...blog.toJSON(),
                likesCount,
                commentsCount
            };
        }));
        
        res.status(200).json({
            success: true,
            data: blogsWithStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching blogs", 
            error: error.message 
        });
    }
};

export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user.id })
            .populate('author', 'fullName email photo')
            .sort({ createdAt: -1 });
        
        // Get likes and comments count for each blog
        const blogsWithStats = await Promise.all(blogs.map(async (blog) => {
            const likesCount = await Like.countDocuments({ blog: blog._id });
            const commentsCount = await Comment.countDocuments({ blog: blog._id });
            return {
                ...blog.toJSON(),
                likesCount,
                commentsCount
            };
        }));
        
        res.status(200).json({
            success: true,
            count: blogsWithStats.length,
            data: blogsWithStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching your blogs", 
            error: error.message 
        });
    }
};

export const getBlogsByAuthor = async (req, res) => {
    try {
        const { authorId } = req.params;
        
        const user = await User.findById(authorId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }
        
        const blogs = await Blog.find({ author: authorId })
            .populate('author', 'fullName email photo')
            .sort({ createdAt: -1 });
        
        // Get likes and comments count for each blog
        const blogsWithStats = await Promise.all(blogs.map(async (blog) => {
            const likesCount = await Like.countDocuments({ blog: blog._id });
            const commentsCount = await Comment.countDocuments({ blog: blog._id });
            return {
                ...blog.toJSON(),
                likesCount,
                commentsCount
            };
        }));
        
        res.status(200).json({
            success: true,
            author: user.fullName,
            count: blogsWithStats.length,
            data: blogsWithStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching author's blogs", 
            error: error.message 
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'fullName email photo');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Get likes count
        const likesCount = await Like.countDocuments({ blog: blog._id });
        
        // Get comments with author details
        const comments = await Comment.find({ blog: blog._id })
            .populate('author', 'fullName email photo')
            .sort({ createdAt: -1 });
        
        // Check if current user liked this blog (if user is authenticated)
        let userLiked = false;
        if (req.user && req.user.id) {
            userLiked = await Like.exists({ blog: blog._id, user: req.user.id });
        }
        
        res.status(200).json({
            success: true,
            data: {
                ...blog.toJSON(),
                likesCount,
                comments,
                userLiked
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching blog", 
            error: error.message 
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Check if user is the author
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own blogs"
            });
        }
        
        // Delete all comments and likes related to this blog
        await Comment.deleteMany({ blog: req.params.id });
        await Like.deleteMany({ blog: req.params.id });
        
        // Delete the blog
        await Blog.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error deleting blog", 
            error: error.message 
        });
    }
};

// Comment Controllers
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }
        
        // Check if blog exists
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Create comment
        const comment = await Comment.create({
            blog: req.params.id,
            author: req.user.id,
            content
        });
        
        // Get populated comment
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'fullName email photo');
        
        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: populatedComment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error adding comment", 
            error: error.message 
        });
    }
};

export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ blog: req.params.id })
            .populate('author', 'fullName email photo')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching comments", 
            error: error.message 
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }
        
        // Check if user is the comment author
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments"
            });
        }
        
        await Comment.findByIdAndDelete(req.params.commentId);
        
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error deleting comment", 
            error: error.message 
        });
    }
};

// Like Controllers
export const likeBlog = async (req, res) => {
    try {
        // Check if blog exists
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Check if user already liked the blog
        const existingLike = await Like.findOne({
            blog: req.params.id,
            user: req.user.id
        });
        
        // Create like
        await Like.create({
            blog: req.params.id,
            user: req.user.id
        });
        
        // Get updated like count
        const likesCount = await Like.countDocuments({ blog: req.params.id });
        
        res.status(200).json({
            success: true,
            message: "Blog liked successfully",
            likesCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error liking blog", 
            error: error.message 
        });
    }
};

export const unlikeBlog = async (req, res) => {
    try {
        // Check if blog exists
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Remove like
        const result = await Like.findOneAndDelete({
            blog: req.params.id,
            user: req.user.id
        });
        
        // Get updated like count
        const likesCount = await Like.countDocuments({ blog: req.params.id });
        
        res.status(200).json({
            success: true,
            message: "Blog unliked successfully",
            likesCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error unliking blog", 
            error: error.message 
        });
    }
};

export const getLikeStatus = async (req, res) => {
    try {
        const liked = await Like.exists({
            blog: req.params.id,
            user: req.user.id
        });
        
        const likesCount = await Like.countDocuments({ blog: req.params.id });
        
        res.status(200).json({
            success: true,
            liked: !!liked,
            likesCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching like status", 
            error: error.message 
        });
    }
};