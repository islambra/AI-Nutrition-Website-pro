// services/blogService.js
import axiosInstance from './axiosInstance';

// ==================== BLOG CRUD OPERATIONS ====================

export const createBlog = async (blogData) => {
  const formData = new FormData();
  formData.append('type', blogData.type);
  formData.append('title', blogData.title);
  formData.append('content', blogData.content);
  formData.append('tags', JSON.stringify(blogData.tags));
  if (blogData.image) {
    formData.append('image', blogData.image);
  }
  
  const response = await axiosInstance.post("/blog/blogs", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateBlog = async (blogId, blogData) => {
  const formData = new FormData();
  if (blogData.type) formData.append('type', blogData.type);
  if (blogData.title) formData.append('title', blogData.title);
  if (blogData.content) formData.append('content', blogData.content);
  if (blogData.tags) formData.append('tags', JSON.stringify(blogData.tags));
  if (blogData.image) formData.append('image', blogData.image);
  
  const response = await axiosInstance.put(`/blog/blogs/${blogId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteBlog = async (blogId) => {
  const response = await axiosInstance.delete(`/blog/blogs/${blogId}`);
  return response.data;
};

// ==================== FETCH BLOGS ====================

export const getAllBlogs = async () => {
  const response = await axiosInstance.get("/blog/blogs");
  return response.data;
};

export const getMyBlogs = async () => {
  const response = await axiosInstance.get("/blog/blogs/my/blogs");
  return response.data;
};

export const getBlogsByAuthor = async (authorId) => {
  const response = await axiosInstance.get(`/blog/blogs/author/${authorId}`);
  return response.data;
};

export const getBlogById = async (blogId) => {
  const response = await axiosInstance.get(`/blog/blogs/${blogId}`);
  return response.data;
};

// ==================== COMMENT OPERATIONS ====================

export const addComment = async (blogId, content) => {
  const response = await axiosInstance.post(`/blog/blogs/${blogId}/comments`, { content });
  return response.data;
};

export const getComments = async (blogId) => {
  const response = await axiosInstance.get(`/blog/blogs/${blogId}/comments`);
  return response.data;
};

export const deleteComment = async (blogId, commentId) => {
  const response = await axiosInstance.delete(`/blog/blogs/${blogId}/comments/${commentId}`);
  return response.data;
};

// ==================== LIKE OPERATIONS ====================

export const likeBlog = async (blogId) => {
  const response = await axiosInstance.post(`/blog/blogs/${blogId}/like`);
  return response.data;
};

export const unlikeBlog = async (blogId) => {
  const response = await axiosInstance.delete(`/blog/blogs/${blogId}/like`);
  return response.data;
};

export const getLikeStatus = async (blogId) => {
  const response = await axiosInstance.get(`/blog/blogs/${blogId}/like/status`);
  return response.data;
};

// ==================== HELPER FUNCTIONS FOR UI ====================

// Toggle like (if liked then unlike, if not liked then like)
export const toggleLike = async (blogId, currentLikedStatus) => {
  if (currentLikedStatus) {
    return await unlikeBlog(blogId);
  } else {
    return await likeBlog(blogId);
  }
};

// Get blog with full details (including likes and comments)
export const getBlogWithDetails = async (blogId) => {
  const response = await getBlogById(blogId);
  return response.data;
};