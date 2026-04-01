import axiosInstance from './axiosInstance';

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
  
  const response = await axiosInstance.put(`/blogs/${blogId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllBlogs = async () => {
  const response = await axiosInstance.get("/blog/blogs");
  return response.data;
};

export const getMyBlogs = async () => {
  const response = await axiosInstance.get("/blog/blogs/my/blogs");
  return response.data;
};

// Get blogs by specific author name (public)
export const getBlogsByAuthor = async (authorName) => {
  const response = await axiosInstance.get(`/blog/blogs/author/${authorName}`);
  return response.data;
};

// Get single blog by ID (public)
export const getBlogById = async (blogId) => {
  const response = await axiosInstance.get(`/blog/blogs/${blogId}`);
  return response.data;
};

// Delete blog (protected - only author)
export const deleteBlog = async (blogId) => {
  const response = await axiosInstance.delete(`/blog/blogs/${blogId}`);
  return response.data;
};

// Add comment to blog (protected)
export const addComment = async (blogId, commentData) => {
  const response = await axiosInstance.post(`/blog/blogs/${blogId}/comments`, commentData);
  return response.data;
};

// Like blog (public)
export const likeBlog = async (blogId) => {
  const response = await axiosInstance.put(`/blog/blogs/${blogId}/like`);
  return response.data;
};

export const dislikeBlog = async (blogId) => {
  const response = await axiosInstance.put(`/blog/blogs/${blogId}/dislike`);
  return response.data;
};