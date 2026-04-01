import Blog from "../models/Blog.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";


export const createBlog = async (req, res) => {
    try {
        const { type, title, content, tags } = req.body;
        
        // Get author name from authenticated user
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
                // Convert buffer to base64
                const base64Image = req.file.buffer.toString('base64');
                
                // Upload to ImageKit
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
            author: user.name,
            title,
            content,
            tags: tags ? JSON.parse(tags) : [],
            likes: 0,
            comments: []
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
        const user = await User.findById(req.user.id);
        if (blog.author !== user.name) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own blogs"
            });
        }
        
        let photoUrl = blog.photo;
        
        // Upload new image to ImageKit if file exists
        if (req.file) {
            try {
                // Convert buffer to base64
                const base64Image = req.file.buffer.toString('base64');
                
                // Upload to ImageKit
                const uploadResponse = await imagekit.upload({
                    file: base64Image,
                    fileName: `${Date.now()}-${req.file.originalname}`,
                    folder: "/blogs",
                });
                
                photoUrl = uploadResponse.url;
                
                // Optional: Delete old image from ImageKit
                if (blog.photo) {
                    // Extract fileId from old URL and delete
                    // This depends on how you want to manage deletion
                }
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
        const blogs = await Blog.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: blogs
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
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const blogs = await Blog.find({ author: user.name }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: blogs.length,
            data: blogs
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
        const { authorName } = req.params;
        
        const user = await User.findOne({ name: authorName });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }
        
        const blogs = await Blog.find({ author: authorName }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            author: authorName,
            count: blogs.length,
            data: blogs
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
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: blog
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
        
        const user = await User.findById(req.user.id);
        if (blog.author !== user.name) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own blogs"
            });
        }
        
        // Optional: Delete image from ImageKit
        if (blog.photo) {
            // Extract fileId from URL and delete
            // You can implement this based on your needs
        }
        
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

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: { 
                        user: user.name, 
                        text, 
                        createdAt: new Date() 
                    }
                }
            },
            { new: true }
        );
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: blog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error adding comment", 
            error: error.message 
        });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Blog liked successfully",
            data: blog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error liking blog", 
            error: error.message 
        });
    }
};

export const dislikeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: -1 } },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: "Blog disliked successfully",
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error disliking blog", 
            error: error.message 
        });
    }
};