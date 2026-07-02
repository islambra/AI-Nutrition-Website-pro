import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogById, addComment, deleteComment, likeBlog, unlikeBlog } from '../api/blogApi';
import { useAuth } from '../context/AuthContext';
import { Utensils, FileText, Users, File, TriangleAlert, MessageCircle } from 'lucide-react';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import './BlogDetailsPage.css';

function BlogDetailsPage() {
  const { t } = useTranslation();
  const { setTimeoutSafe } = useSafeTimeout();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // For confirmation modal

  useEffect(() => {
    fetchBlogDetails();
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await getBlogById(id);
      setBlog(response.data);
      setLiked(response.data.userLiked || false);
      setLikesCount(response.data.likesCount || 0);
      setError('');
    } catch (err) {
      setError(t('blogs.failedToLoadBlog'));
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        const response = await unlikeBlog(id);
        setLiked(false);
        setLikesCount(response.likesCount);
        showTemporaryNotification(t('blogs.unlike'), 'success');
      } else {
        const response = await likeBlog(id);
        setLiked(true);
        setLikesCount(response.likesCount);
        showTemporaryNotification(t('blogs.like'), 'success');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      showTemporaryNotification(t('common.error'), 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const response = await addComment(id, commentText);
      setBlog(prev => ({
        ...prev,
        comments: [response.data, ...(prev.comments || [])]
      }));
      setCommentText('');
      showTemporaryNotification(t('common.success'), 'success');
    } catch (err) {
      console.error('Error adding comment:', err);
      showTemporaryNotification(t('common.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Show confirmation modal instead of browser alert
  const confirmDeleteComment = (commentId) => {
    setDeleteConfirmId(commentId);
  };

  const handleDeleteComment = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteComment(id, deleteConfirmId);
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== deleteConfirmId)
      }));
      showTemporaryNotification(t('common.success'), 'success');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      showTemporaryNotification(t('common.error'), 'error');
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const showTemporaryNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeoutSafe(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showTemporaryNotification(t('common.success'), 'success');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      showTemporaryNotification(t('common.error'), 'error');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Recipe': return <Utensils size={18} />;
      case 'Article': return <FileText size={18} />;
      case 'Community': return <Users size={18} />;
      default: return <File size={18} />;
    }
  };

  const canDeleteComment = (commentAuthor) => {
    if (!currentUser || !commentAuthor) return false;
    
    const currentUserId = currentUser._id || currentUser.id;
    const commentAuthorId = commentAuthor._id || commentAuthor;
    
    return currentUserId === commentAuthorId;
  };

  if (loading) {
    return (
      <div className="blog-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-details-container">
        <div className="error-container">
          <div className="error-icon"><TriangleAlert size={40} /></div>
          <h3>{t('common.somethingWrong')}</h3>
          <p>{error || t('blogs.noPosts')}</p>
          <button className="btn bl-btn-primary" onClick={() => navigate('/blogs')}>
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blog-details-container">
        {/* Notification Toast */}
        {showNotification && (
          <div className={`share-notification ${notificationType === 'error' ? 'error' : 'success'}`}>
            <div className="notification-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {notificationType === 'error' ? (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </>
                ) : (
                  <path d="M20 6L9 17l-5-5" />
                )}
              </svg>
              <span>{notificationMessage}</span>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>{t('blogs.deleteConfirm')}</h3>
              <p>{t('blogs.deleteConfirm')}</p>
              <div className="modal-actions">
                <button className="modal-btn modal-btn-cancel" onClick={cancelDelete}>
                  {t('common.cancel')}
                </button>
                <button className="modal-btn modal-btn-delete" onClick={handleDeleteComment}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button className="back-button" onClick={() => navigate('/blogs')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('common.back')}
        </button>

        <div className="blog-details-layout">
          {/* Left Column - Blog Content */}
          <div className="blog-content-section">
            <article className="blog-details-card">
              <div className="blog-header">
                <div className="blog-type-badge">{getTypeIcon(blog.type)} {blog.type}</div>
                <h1 className="blog-title">{blog.title}</h1>
                <div className="blog-author-info">
                  <div className="author-avatar">
                    {blog.author?.photo ? (
                      <img src={blog.author.photo} alt={blog.author.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {blog.author?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="author-details">
                    <span className="author-name">{blog.author?.fullName || blog.author}</span>
                    <span className="blog-date">{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
              </div>

              {blog.photo && (
                <div className="blog-featured-image">
                  <img src={blog.photo} alt={blog.title} />
                </div>
              )}

              <div className="blog-body">
                <p className="blog-content-text">{blog.content}</p>
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-tags-section">
                  <h4>Tags</h4>
                  <div className="blog-tags-list">
                    {blog.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="blog-actions-section">
                <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{likesCount} {t('blogs.like')}</span>
                </button>
                <button className="share-button" onClick={handleShare}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>{t('common.edit')}</span>
                </button>
              </div>
            </article>
          </div>

          {/* Right Column - Comments Section */}
          <div className="comments-section">
            <div className="comments-card">
              <div className="comments-header">
                <h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  {t('blogs.title')} ({blog.comments?.length || 0})
                </h3>
              </div>

              {/* Add Comment Form */}
              {currentUser ? (
                <form onSubmit={handleAddComment} className="add-comment-form">
                  <div className="comment-input-wrapper">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t('blogs.writeComment')}
                      rows="3"
                      disabled={submitting}
                    />
                    <button type="submit" disabled={submitting || !commentText.trim()}>
                      {submitting ? t('common.loading') : t('blogs.writeComment')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="login-to-comment">
                  <p>{t('common.authRequired')}</p>
                </div>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-avatar">
                        {comment.author?.photo ? (
                          <img src={comment.author.photo} alt={comment.author.fullName} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {comment.author?.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author?.fullName}</span>
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        {canDeleteComment(comment.author) && (
                          <button 
                            className="delete-comment-btn"
                            onClick={() => confirmDeleteComment(comment._id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">
                    <div className="no-comments-icon"><MessageCircle size={40} /></div>
                    <p>{t('blogs.noPosts')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BlogDetailsPage;