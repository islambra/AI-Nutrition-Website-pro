import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBlogs, likeBlog, unlikeBlog, getLikeStatus } from '../api/blogApi';
import './BlogsPage.css';
import Footer from '../components/Footer';

function BlogsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [likesStates, setLikesStates] = useState({});
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogs();
      setPosts(response.data);
      setError('');
      await fetchAllLikesStatus(response.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLikesStatus = async (blogs) => {
    try {
      const likeStatusPromises = blogs.map(async (blog) => {
        try {
          const statusResponse = await getLikeStatus(blog._id);
          return { blogId: blog._id, liked: statusResponse.liked, likesCount: statusResponse.likesCount };
        } catch (err) {
          return { blogId: blog._id, liked: false, likesCount: blog.likesCount || 0 };
        }
      });
      
      const statuses = await Promise.all(likeStatusPromises);
      const likesMap = {};
      statuses.forEach(status => {
        likesMap[status.blogId] = {
          liked: status.liked,
          likesCount: status.likesCount
        };
      });
      
      setLikesStates(likesMap);
    } catch (err) {
      console.error('Error fetching likes status:', err);
    }
  };

  const handleLike = async (blogId, isCurrentlyLiked) => {
    try {
      if (isCurrentlyLiked) {
        const response = await unlikeBlog(blogId);
        setLikesStates(prev => ({
          ...prev,
          [blogId]: {
            liked: false,
            likesCount: response.likesCount
          }
        }));
      } else {
        const response = await likeBlog(blogId);
        setLikesStates(prev => ({
          ...prev,
          [blogId]: {
            liked: true,
            likesCount: response.likesCount
          }
        }));
      }
    } catch (err) {
      console.error('Error handling blog like/unlike:', err);
    }
  };

  const handleCreatePost = () => {
    navigate('/dashboard/blogs/create');
  };

  const handleShare = async (blog) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blog._id}`);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'All Posts') return true;
    return post.type === activeFilter;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTypeEmoji = (type) => {
    switch(type) {
      case 'Recipe':
        return '🍳';
      case 'Article':
        return '📝';
      case 'Community':
        return '👥';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="blogs-page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blogs-page-container">
        {/* Custom Notification */}
          {showNotification && (
            <div className="share-notification">
              <div className="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>Link copied to clipboard</span>
              </div>
            </div>
          )}

        <header className="blogs-hero">
          <h1 className="animate-in">Nutrition <span className="bl-text-gradient">Knowledge Hub</span></h1>
          <p className="animate-in" style={{ animationDelay: '0.1s' }}>Explore healthy recipes, expert blogs, and wellness tips from our certified nutritionists.</p>
          
          <div className="blogs-filter animate-in" style={{ animationDelay: '0.2s' }}>
            <button 
              className={`filter-btn ${activeFilter === 'All Posts' ? 'active' : ''}`}
              onClick={() => setActiveFilter('All Posts')}
            >
              All Posts
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Recipe' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Recipe')}
            >
              Recipes
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Article' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Article')}
            >
              Articles
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Community' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Community')}
            >
              Community
            </button>
          </div>
        </header>

        <main className="blogs-grid-section">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {filteredPosts.length === 0 && !error ? (
            <div className="no-posts">
              <div className="no-posts-icon">📭</div>
              <h3>No posts found</h3>
              <p>Be the first to share your knowledge with the community!</p>
              <button className="btn bl-btn-primary" onClick={handleCreatePost}>
                Create a Post
              </button>
            </div>
          ) : (
            <div className="blogs-grid">
              {filteredPosts.map((post, index) => {
                const likeState = likesStates[post._id] || { 
                  liked: false, 
                  likesCount: post.likesCount || 0 
                };
                
                return (
                  <article key={post._id} className="blog-card animate-in" style={{ animationDelay: `${0.05 * index}s` }}>
                    <div className="blog-card-image">
                      {post.photo ? (
                        <img src={post.photo} alt={post.title} className="blog-image" />
                      ) : (
                        <span className="blog-emoji">{getTypeEmoji(post.type)}</span>
                      )}
                      <span className={`blog-type-tag ${post.type.toLowerCase()}`}>{post.type}</span>
                    </div>
                    <div className="blog-card-content">
                      <div className="blog-meta">
                        <span className="author-name">{post.author?.fullName || post.author}</span> • 
                        <span className="blog-date">{formatDate(post.createdAt)}</span>
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content}</p>
                      <div className="blog-tags">
                        {post.tags && post.tags.map((tag, idx) => (
                          <span key={idx} className="tag">#{tag}</span>
                        ))}
                      </div>
                      <div className="blog-actions">
                        <button 
                          className={`action-btn ${likeState.liked ? 'liked' : ''}`}
                          onClick={() => handleLike(post._id, likeState.liked)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={likeState.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {likeState.likesCount}
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => handleReadMore(post._id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          {post.commentsCount || 0}
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => handleShare(post)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <section className="create-blog-cta animate-in">
          <div className="cta-card nutritionist-access">
            <h2>Are you a certified Nutritionist?</h2>
            <p>Share your expertise with our growing community. Post recipes, articles, and help others lead healthier lives.</p>
            <button className="btn bl-btn-primary" onClick={handleCreatePost}>Create a Post</button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default BlogsPage;