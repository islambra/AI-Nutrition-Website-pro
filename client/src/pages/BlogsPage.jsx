import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, MessageCircle, Share2, Clock, User, Leaf, Sparkles, Zap, ArrowUpRight
} from 'lucide-react';
import { getAllBlogs, likeBlog, unlikeBlog, getLikeStatus } from '../api/blogApi';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import './BlogsPage.css';

// Helper functions for author data
const getAuthorName = (author, t) => {
  if (!author) return t ? t('blogs.authorFallback') : 'VITAL_EXPERT';
  if (typeof author === 'object' && author.fullName) return author.fullName;
  return t ? t('blogs.authorFallback') : 'VITAL_EXPERT';
};

const getAuthorPhoto = (author) => {
  if (author && typeof author === 'object' && author.photo) return author.photo;
  return null;
};

// Organic floaters (unchanged)
const BlogsOrganicFloaters = memo(() => (
  <div className="BlogsPage-Organic-Container">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="BlogsPage-Floater"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.15, 0], 
          x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
          y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
        }}
        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
      >
        <Leaf size={40 + i * 20} strokeWidth={1} />
      </motion.div>
    ))}
  </div>
));

function BlogsPage() {
  const { t } = useTranslation();
  const { setTimeoutSafe } = useSafeTimeout();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [likesStates, setLikesStates] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogs();
      // API returns { success: true, data: [...] }
      const blogsArray = response.data?.data || response.data || [];
      setPosts(blogsArray);
      setError('');
      await fetchAllLikesStatus(blogsArray);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(t('blogs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLikesStatus = async (blogs) => {
    if (!blogs.length) return;
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

  const handleLike = async (e, blogId, isCurrentlyLiked) => {
    e.stopPropagation();
    try {
      if (isCurrentlyLiked) {
        const response = await unlikeBlog(blogId);
        setLikesStates(prev => ({
          ...prev,
          [blogId]: { liked: false, likesCount: response.likesCount }
        }));
      } else {
        const response = await likeBlog(blogId);
        setLikesStates(prev => ({
          ...prev,
          [blogId]: { liked: true, likesCount: response.likesCount }
        }));
      }
    } catch (err) {
      console.error('Error handling blog like/unlike:', err);
    }
  };

  const handleShare = async (e, blog) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blog._id}`);
      setShowNotification(true);
      setTimeoutSafe(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = activeFilter === 'All Posts' || post.type === activeFilter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Recipe': return <Zap size={14} />;
      case 'Article': return <FileText size={14} />;
      case 'Community': return <Users size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="BlogsPage-Loader-Wrapper">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="BlogsPage-Loader-Icon"
        >
          <Leaf size={60} color="#2D5A27" />
        </motion.div>
        <p>CALIBRATING_KNOWLEDGE_BASE...</p>
      </div>
    );
  }

  return (
    <div className="BlogsPage-Main-Wrapper">
      <BlogsOrganicFloaters />
      <div className="BlogsPage-Grid-Overlay" />

      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="BlogsPage-Notification"
          >
            <Share2 size={16} />
            <span>KNOWLEDGE_LINK_COPIED</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="BlogsPage-Hero">
        <div className="BlogsPage-Hero-Content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="BlogsPage-Badge">
            VITAL_INTELLIGENCE
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="BlogsPage-Title">
            THE VITALITY <br /> <span className="BlogsPage-Gradient-Text">KNOWLEDGE HUB.</span>
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="BlogsPage-Controls">
            <div className="BlogsPage-Search-Box">
              <Search size={20} className="BlogsPage-Search-Icon" />
              <input type="text" placeholder="SEARCH_BIOLOGICAL_RESOURCES..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="BlogsPage-Filters">
              {['All Posts', 'Recipe', 'Article', 'Community'].map((filter) => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`BlogsPage-Filter-Btn ${activeFilter === filter ? 'active' : ''}`}>
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="BlogsPage-Content">
        {error ? (
          <div className="BlogsPage-Error">
            <Zap size={40} />
            <h3>SYSTEM_ERROR</h3>
            <p>{error}</p>
            <button onClick={fetchBlogs}>REBOOT_CONNECTION</button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="BlogsPage-Empty">
            <Sparkles size={60} opacity={0.3} />
            <h3>ZERO_MATCHES_FOUND</h3>
            <p>{t('blogs.noPosts')}</p>
          </div>
        ) : (
          <div className="BlogsPage-Grid">
            {filteredPosts.map((post, index) => {
              const likeState = likesStates[post._id] || { liked: false, likesCount: post.likesCount || 0 };
              const authorName = getAuthorName(post.author, t);
              const authorPhoto = getAuthorPhoto(post.author);
              
              return (
                <motion.article key={post._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} onClick={() => handleReadMore(post._id)} className="BlogsPage-Card">
                  <div className="BlogsPage-Card-Image-Wrapper">
                    {post.photo ? <img src={post.photo} alt={post.title} className="BlogsPage-Card-Image" /> : <div className="BlogsPage-Card-Placeholder"><Leaf size={60} strokeWidth={1} /></div>}
                    <div className="BlogsPage-Card-Tag">{getTypeIcon(post.type)}<span>{post.type.toUpperCase()}</span></div>
                  </div>
                  <div className="BlogsPage-Card-Body">
                    <div className="BlogsPage-Card-Meta">
                      <div className="BlogsPage-Author">
                        {authorPhoto ? <img src={authorPhoto} alt={authorName} className="BlogsPage-Author-Image" referrerPolicy="no-referrer" /> : <div className="BlogsPage-Author-Placeholder"><User size={12} /></div>}
                        <span>{authorName}</span>
                      </div>
                      <div className="BlogsPage-Date"><Clock size={14} /><span>{formatDate(post.createdAt)}</span></div>
                    </div>
                    <h3 className="BlogsPage-Card-Title">{post.title}</h3>
                    <p className="BlogsPage-Card-Excerpt">{post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}</p>
                    <div className="BlogsPage-Card-Tags">{post.tags && post.tags.slice(0, 3).map((tag, idx) => <span key={idx} className="BlogsPage-Tag-Pill">#{tag.toUpperCase()}</span>)}</div>
                    <div className="BlogsPage-Card-Footer">
                      <div className="BlogsPage-Stats">
                        <button className={`BlogsPage-Stat-Btn ${likeState.liked ? 'liked' : ''}`} onClick={(e) => handleLike(e, post._id, likeState.liked)}>
                          <Heart size={18} fill={likeState.liked ? "currentColor" : "none"} /><span>{likeState.likesCount}</span>
                        </button>
                        <button className="BlogsPage-Stat-Btn"><MessageCircle size={18} /><span>{post.commentsCount || 0}</span></button>
                      </div>
                      <button className="BlogsPage-Share-Btn" onClick={(e) => handleShare(e, post)}><Share2 size={18} /></button>
                    </div>
                  </div>
                  <div className="BlogsPage-Card-Hover-Indicator"><ArrowUpRight size={20} /></div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const FileText = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const Users = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default BlogsPage;