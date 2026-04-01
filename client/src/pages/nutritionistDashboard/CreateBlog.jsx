import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../../api/blogApi";
import "./CreateBlog.css";

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

  // Helper function to resize image to very small size
  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.5) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Make it even smaller - max 600px
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
          
          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with high compression
          canvas.toBlob(
            (blob) => {
              // Create a new file from the blob
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Force JPEG for better compression
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            'image/jpeg', // Force JPEG format for smaller size
            0.4 // 40% quality for very small size
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError("");
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (original file size check)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      
      try {
        setLoading(true);
        
        // Resize the image to very small size
        const resizedImage = await resizeImage(file);
        
        // Log the size reduction
        const originalSizeKB = (file.size / 1024).toFixed(2);
        const resizedSizeKB = (resizedImage.size / 1024).toFixed(2);
        const reduction = ((1 - resizedImage.size / file.size) * 100).toFixed(1);
        
        console.log(`Image optimized: ${originalSizeKB}KB → ${resizedSizeKB}KB (${reduction}% smaller)`);
        
        setFormData({
          ...formData,
          image: resizedImage
        });
        
        // Create preview with resized image (so preview shows optimized version)
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setLoading(false);
        };
        reader.readAsDataURL(resizedImage);
        
      } catch (error) {
        setError(error,"Error processing image. Please try again.");
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
    
    // Validation
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
      // Prepare tags array
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      const blogData = {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        image: formData.image // This is already the resized image (JPEG, 40% quality)
      };
      
       await createBlog(blogData);
      
      setSuccess("Blog created successfully!");
      
      // Scroll to top to show success message
      scrollToTop();
      
      // Reset form after successful submission
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
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
      <div className="create-blog-header">
        <h1>Create New Blog</h1>
        <p>Share your knowledge, recipes, or stories with the community</p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="create-blog-form">
        {/* Blog Type Selection */}
        <div className="form-group">
          <label htmlFor="type">
            Blog Type <span className="required">*</span>
          </label>
          <div className="type-buttons">
            <button
              type="button"
              className={`type-btn ${formData.type === "Recipe" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Recipe"})}
            >
              🍳 Recipe
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === "Article" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Article"})}
            >
              📝 Article
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === "Community" ? "active" : ""}`}
              onClick={() => setFormData({...formData, type: "Community"})}
            >
              👥 Community
            </button>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="image">Featured Image</label>
          <input
            type="file"
            ref={fileInputRef}
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <div 
            className="image-upload-area"
            onClick={handleImageClick}
          >
            {loading && !imagePreview ? (
              <div className="image-placeholder">
                <div className="spinner"></div>
                <p>Optimizing image...</p>
                <small>Making it smaller for faster loading</small>
              </div>
            ) : imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <div className="upload-icon">📷</div>
                <p>Click to upload an image</p>
                <small>Will be optimized to ~600px and 40% quality for fast loading</small>
              </div>
            )}
          </div>
        </div>
        
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a catchy title..."
            className="form-input"
          />
        </div>
        
        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g., Healthy, Quick, Vegan, Breakfast"
            className="form-input"
          />
          <small className="form-hint">
            Separate tags with commas for better discoverability
          </small>
        </div>
        
        {/* Content */}
        <div className="form-group">
          <label htmlFor="content">
            Content <span className="required">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows="10"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your blog content here..."
            className="form-textarea"
          />
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn cb-btn-secondary"
          >
            Clear All
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn cb-btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Publishing...
              </>
            ) : (
              "Publish Blog"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;