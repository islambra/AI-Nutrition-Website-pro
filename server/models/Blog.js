import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    photo: {
        type: String, // ImageKit URL
        default: null
    },
    type: {
        type: String,
        enum: ["Recipe", "Article", "Community"],
        required: true
    },
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;