import React, { useState, useEffect } from 'react';
import { 
  getMyBlogs, updateBlog, deleteBlog 
} from '../../api/blogApi';
import { 
  Edit, Trash2, Image, X, AlertTriangle, CheckCircle, XCircle,
  FileText, Zap, Users, Sparkles, Clock, User 
} from 'lucide-react';
import './DieteticienBlogs.css';

const DieteticienBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Article',
    title: '',
    content: '',
    tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getMyBlogs();
      setBlogs(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  // Open edit modal
  const openEditModal = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      type: blog.type,
      title: blog.title,
      content: blog.content,
      tags: blog.tags?.join(', ') || '',
    });
    setImagePreview(blog.photo || null);
    setImageFile(null);
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const updateData = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      if (imageFile) {
        updateData.image = imageFile;
      }
      const res = await updateBlog(currentBlog._id, updateData);
      // Update the blog in the list
      setBlogs(prev => prev.map(blog => 
        blog._id === currentBlog._id ? { ...blog, ...res.data } : blog
      ));
      showToast('Blog updated successfully');
      setEditModalOpen(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await deleteBlog(blogToDelete._id);
      setBlogs(prev => prev.filter(b => b._id !== blogToDelete._id));
      showToast('Blog deleted successfully');
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ type: 'Article', title: '', content: '', tags: '' });
    setImageFile(null);
    setImagePreview(null);
    setCurrentBlog(null);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Recipe': return <Zap size={16} />;
      case 'Article': return <FileText size={16} />;
      case 'Community': return <Users size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  if (loading) return (
    <div className="Dieteticien-blogs-loading">
      <div className="loading-spinner"></div>
      <p>Loading your blogs...</p>
    </div>
  );

  if (error) return (
    <div className="Dieteticien-blogs-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load blogs</h3>
      <p>{error}</p>
      <button onClick={fetchBlogs} className="retry-btn">Retry</button>
    </div>
  );

  return (
    <div className="Dieteticien-blogs-container">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="blogs-header">
        <h1>My Blog Posts</h1>
        <p className="subtitle">Manage your published articles and recipes</p>
      </div>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={48} /></div>
          <h3>No blogs yet</h3>
          <p>You haven't created any blog posts. Use the create button to start writing.</p>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map(blog => (
            <div key={blog._id} className="blog-card">
              {blog.photo && (
                <div className="card-image">
                  <img src={blog.photo} alt={blog.title} />
                </div>
              )}
              <div className="card-content">
                <div className="card-meta">
                  <span className="blog-type">
                    {getTypeIcon(blog.type)} {blog.type}
                  </span>
                  <span className="blog-date">
                    <Clock size={12} /> {formatDate(blog.createdAt)}
                  </span>
                </div>
                <h3>{blog.title}</h3>
                <p className="excerpt">
                  {blog.content.length > 120 ? `${blog.content.substring(0, 120)}...` : blog.content}
                </p>
                <div className="card-tags">
                  {blog.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => openEditModal(blog)}>
                    <Edit size={16} /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => openDeleteModal(blog)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Blog Post</h3>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="Article">Article</option>
                  <option value="Recipe">Recipe</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea name="content" rows="6" value={formData.content} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., health, nutrition, wellness" />
              </div>
              <div className="form-group">
                <label>Featured Image</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" className="remove-image" onClick={() => { setImagePreview(null); setImageFile(null); }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <Image size={24} />
                      <span>Click to upload image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Delete Blog Post</h3>
            <p>Are you sure you want to delete "<strong>{blogToDelete?.title}</strong>"?</p>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="btn-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DieteticienBlogs;