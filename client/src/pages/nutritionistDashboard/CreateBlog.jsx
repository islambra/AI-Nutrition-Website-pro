import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../../api/blogApi";
import "./CreateBlog.css";

// SVG Icon Components
const Icons = {
  Camera: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Tag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Sparkles: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3L14 8L19 9L15.5 12.5L17 18L12 15L7 18L8.5 12.5L5 9L10 8L12 3Z"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  ImageIcon: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="2.5"/><polyline points="21 15 16 10 5 21"/></svg>
};

const CreateBlog = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "Recipe",
    title: "",
    content: "",
    tags: "",
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.5) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 600;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            'image/jpeg',
            0.4
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      type: "Recipe",
      title: "",
      content: "",
      tags: "",
      image: null
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      
      try {
        setLoading(true);
        const resizedImage = await resizeImage(file);
        const originalSizeKB = (file.size / 1024).toFixed(2);
        const resizedSizeKB = (resizedImage.size / 1024).toFixed(2);
        console.log(`Image optimized: ${originalSizeKB}KB → ${resizedSizeKB}KB`);
        
        setFormData({ ...formData, image: resizedImage });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setLoading(false);
        };
        reader.readAsDataURL(resizedImage);
      } catch (error) {
        setError("Error processing image. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Please enter a title");
      scrollToTop();
      return;
    }
    if (!formData.content.trim()) {
      setError("Please enter content");
      scrollToTop();
      return;
    }
    if (!formData.type) {
      setError("Please select a blog type");
      scrollToTop();
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      const blogData = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        image: formData.image
      };
      
      await createBlog(blogData);
      setSuccess("Blog created successfully!");
      scrollToTop();
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating blog. Please try again.");
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    scrollToTop();
    setError("");
    setSuccess("");
  };

  return (
    <div className="create-blog-container" ref={formRef}>
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="blog-hero-badge">
          <Icons.Sparkles />
          <span>Share Your Story</span>
        </div>
        <h1 className="blog-hero-title">Create New Blog</h1>
        <p className="blog-hero-subtitle">Share your knowledge, recipes, or stories with the community</p>
      </div>
      
      {/* Alert Messages */}
      {error && (
        <div className="modern-alert modern-alert-error">
          <div className="alert-icon"><Icons.Alert /></div>
          <div className="alert-content">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button className="alert-close" onClick={() => setError("")}><Icons.X /></button>
        </div>
      )}
      
      {success && (
        <div className="modern-alert modern-alert-success">
          <div className="alert-icon"><Icons.Check /></div>
          <div className="alert-content">
            <strong>Success!</strong>
            <p>{success}</p>
          </div>
          <button className="alert-close" onClick={() => setSuccess("")}><Icons.X /></button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="create-blog-form">
        {/* Blog Type Selection */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            Blog Type <span className="required-star">*</span>
          </label>
          <div className="type-cards">
            <button
              type="button"
              className={`type-card ${formData.type === "Recipe" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Recipe"})}
            >
              <span className="type-card-emoji">🍳</span>
              <span className="type-card-title">Recipe</span>
              <span className="type-card-desc">Share your culinary creations</span>
            </button>
            <button
              type="button"
              className={`type-card ${formData.type === "Article" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Article"})}
            >
              <span className="type-card-emoji">📝</span>
              <span className="type-card-title">Article</span>
              <span className="type-card-desc">Write informative content</span>
            </button>
            <button
              type="button"
              className={`type-card ${formData.type === "Community" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Community"})}
            >
              <span className="type-card-emoji">👥</span>
              <span className="type-card-title">Community</span>
              <span className="type-card-desc">Engage with the community</span>
            </button>
          </div>
        </div>
        
        {/* Image Upload - Modern Design */}
        <div className="form-group-modern">
          <label className="form-label-modern">Featured Image</label>
          <div 
            className="modern-image-upload"
            onClick={handleImageClick}
          >
            {loading && !imagePreview ? (
              <div className="upload-loading">
                <div className="upload-spinner"></div>
                <p>Optimizing image...</p>
                <small>Making it smaller for faster loading</small>
              </div>
            ) : imagePreview ? (
              <div className="upload-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <Icons.Trash />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-wrapper">
                  <Icons.Upload />
                </div>
                <h4>Upload an image</h4>
                <p>Click or drag and drop</p>
                <small>JPEG, PNG up to 5MB • Will be optimized for web</small>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>
        
        {/* Title */}
        <div className="form-group-modern">
          <label className="form-label-modern" htmlFor="title">
            Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a catchy title..."
            className="modern-input"
          />
          <div className="input-character-count">{formData.title.length}/100</div>
        </div>
        
        {/* Tags */}
        <div className="form-group-modern">
          <label className="form-label-modern" htmlFor="tags">
            <Icons.Tag /> Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Healthy, Quick, Vegan, Breakfast"
            className="modern-input"
          />
          <small className="form-hint-modern">
            Separate tags with commas for better discoverability
          </small>
        </div>
        
        {/* Content */}
        <div className="form-group-modern">
          <label className="form-label-modern" htmlFor="content">
            Content <span className="required-star">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows="12"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your blog content here..."
            className="modern-textarea"
          />
        </div>
        
        {/* Form Actions */}
        <div className="form-actions-modern">
          <button
            type="button"
            onClick={handleCancel}
            className="modern-btn modern-btn-secondary"
          >
            Clear All
          </button>
          <button
            type="submit"
            disabled={loading}
            className="modern-btn modern-btn-primary"
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Publishing...
              </>
            ) : (
              <>
                Publish Blog
                <Icons.ArrowRight />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;