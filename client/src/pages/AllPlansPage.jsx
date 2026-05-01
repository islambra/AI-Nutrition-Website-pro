import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, DollarSign, Target, Users, Clock, 
  Activity, Search, Filter, X, Eye, ChevronRight,
  Heart, Award, Zap, Loader2, SlidersHorizontal,
  Grid3X3, List, TrendingUp, User, Mail, Star,
  ShoppingCart, Info
} from 'lucide-react';
import { getAllPlans, getPlanCategories } from '../api/planApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import './AllPlansPage.css';

function AllPlansPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [durationRange, setDurationRange] = useState({ min: '', max: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view plans');
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchPlans();
    }
  }, [isAuthenticated, authLoading]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPlans();
      if (response.success) {
        setPlans(response.data || []);
        setFilteredPlans(response.data || []);
      } else {
        setError('Failed to load plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Error loading plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort plans
  useEffect(() => {
    let result = [...plans];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(plan => 
        plan.planName?.toLowerCase().includes(term) ||
        plan.description?.toLowerCase().includes(term) ||
        plan.targetUserProfile?.toLowerCase().includes(term) ||
        plan.planCategory?.toLowerCase().includes(term) ||
        plan.creatorInfo?.fullName?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(plan => plan.planCategory === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      result = result.filter(plan => plan.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(plan => plan.price <= Number(priceRange.max));
    }

    // Duration range filter
    if (durationRange.min) {
      result = result.filter(plan => plan.duration >= Number(durationRange.min));
    }
    if (durationRange.max) {
      result = result.filter(plan => plan.duration <= Number(durationRange.max));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        result.sort((a, b) => a.duration - b.duration);
        break;
      case 'name':
        result.sort((a, b) => a.planName?.localeCompare(b.planName));
        break;
      default:
        break;
    }

    setFilteredPlans(result);
  }, [plans, searchTerm, selectedCategory, sortBy, priceRange, durationRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
    setDurationRange({ min: '', max: '' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Diabetes': '#EF4444',
      'Weight Loss': '#F59E0B',
      'Weight Gain': '#10B981',
      'Muscle Gain': '#3B82F6',
      'PCOS & Hormonal Balance': '#8B5CF6',
      'Postpartum Recovery': '#EC4899',
      'Complete Healthy Food': '#22C55E',
      'Ramadan': '#F97316',
      'Summer Shape-Up': '#06B6D4',
      'Other': '#6B7280'
    };
    return colors[category] || '#22C55E';
  };

  const categories = getPlanCategories();

  // Loading state
  if (authLoading || (loading && plans.length === 0)) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>Loading plans...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="AP-Wrapper">
        <div className="AP-Container">
          {/* Header */}
          <div className="AP-Header">
            <ScrollReveal>
              <h1 className="AP-Title">
                Nutrition <span className="AP-Highlight">Plans</span>
              </h1>
              <p className="AP-Subtitle">
                Discover personalized nutrition plans created by our expert nutritionists
              </p>
            </ScrollReveal>

            {/* Search and Controls */}
            <div className="AP-Controls">
              <div className="AP-SearchBar">
                <Search size={20} className="AP-SearchIcon" />
                <input
                  type="text"
                  placeholder="Search plans, categories, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="AP-SearchInput"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="AP-ClearSearch">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="AP-ControlButtons">
                <button
                  className={`AP-FilterBtn ${showFilters ? 'AP-FilterActive' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                  {(selectedCategory || priceRange.min || priceRange.max || durationRange.min || durationRange.max) && (
                    <span className="AP-FilterBadge">!</span>
                  )}
                </button>
                <div className="AP-ViewToggle">
                  <button
                    className={`AP-ViewBtn ${viewMode === 'grid' ? 'AP-ViewActive' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    className={`AP-ViewBtn ${viewMode === 'list' ? 'AP-ViewActive' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="AP-FiltersPanel"
                >
                  <div className="AP-FiltersGrid">
                    {/* Category Filter */}
                    <div className="AP-FilterGroup">
                      <label>Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="AP-FilterGroup">
                      <label>Price Range ($)</label>
                      <div className="AP-RangeInputs">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Duration Range */}
                    <div className="AP-FilterGroup">
                      <label>Duration (weeks)</label>
                      <div className="AP-RangeInputs">
                        <input
                          type="number"
                          placeholder="Min"
                          value={durationRange.min}
                          onChange={(e) => setDurationRange(prev => ({ ...prev, min: e.target.value }))}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={durationRange.max}
                          onChange={(e) => setDurationRange(prev => ({ ...prev, max: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Sort By */}
                    <div className="AP-FilterGroup">
                      <label>Sort By</label>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="duration">Duration</option>
                        <option value="name">Name</option>
                      </select>
                    </div>
                  </div>

                  <div className="AP-FilterActions">
                    <button onClick={clearFilters} className="AP-ClearFiltersBtn">
                      <X size={16} /> Clear All Filters
                    </button>
                    <span className="AP-ResultsCount">
                      {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error State */}
          {error && (
            <div className="AP-Error">
              <Info size={20} />
              <span>{error}</span>
              <button onClick={fetchPlans}>Retry</button>
            </div>
          )}

          {/* Plans Grid/List */}
          {filteredPlans.length === 0 ? (
            <div className="AP-EmptyState">
              <Search size={64} />
              <h2>No Plans Found</h2>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={clearFilters} className="AP-ClearFiltersBtn">
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="AP-Grid">
              {filteredPlans.map((plan, index) => (
                <ScrollReveal key={plan._id} delay={index * 0.05}>
                  <motion.div
                    className="AP-Card"
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => navigate(`/dashboard/plans/${plan._id}`)}
                  >
                    {/* Card Image */}
                    <div className="AP-CardImage">
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} />
                      ) : (
                        <div className="AP-CardImagePlaceholder">
                          <Target size={40} />
                        </div>
                      )}
                      <div
                        className="AP-CategoryBadge"
                        style={{ backgroundColor: getCategoryColor(plan.planCategory) }}
                      >
                        {plan.planCategory}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="AP-CardContent">
                      <h3 className="AP-CardTitle">{plan.planName}</h3>
                      <p className="AP-CardDescription">
                        {plan.description?.length > 100
                          ? `${plan.description.substring(0, 100)}...`
                          : plan.description}
                      </p>

                      <div className="AP-CardMeta">
                        <span><Calendar size={14} /> {plan.duration} weeks</span>
                        <span><DollarSign size={14} /> ${plan.price}</span>
                        <span><Target size={14} /> {plan.targetUserProfile}</span>
                      </div>

                      <div className="AP-CardFooter">
                        <div className="AP-CreatorInfo">
                          {plan.creatorInfo?.photo ? (
                            <img src={plan.creatorInfo.photo} alt={plan.creatorInfo.fullName} className="AP-CreatorAvatar" />
                          ) : (
                            <div className="AP-CreatorAvatarFallback">
                              {plan.creatorInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="AP-CreatorName">
                            {plan.creatorInfo?.fullName || 'Unknown'}
                          </span>
                        </div>
                        <button
                          className="AP-ViewPlanBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/plans/${plan._id}`);
                          }}
                        >
                          View <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="AP-List">
              {filteredPlans.map((plan, index) => (
                <ScrollReveal key={plan._id} delay={index * 0.03}>
                  <motion.div
                    className="AP-ListItem"
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/dashboard/plans/${plan._id}`)}
                  >
                    <div className="AP-ListItemImage">
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} />
                      ) : (
                        <div className="AP-CardImagePlaceholder">
                          <Target size={28} />
                        </div>
                      )}
                    </div>
                    <div className="AP-ListItemContent">
                      <div className="AP-ListItemHeader">
                        <h3>{plan.planName}</h3>
                        <span
                          className="AP-ListCategoryBadge"
                          style={{ backgroundColor: getCategoryColor(plan.planCategory) }}
                        >
                          {plan.planCategory}
                        </span>
                      </div>
                      <p className="AP-ListItemDescription">
                        {plan.description?.length > 120
                          ? `${plan.description.substring(0, 120)}...`
                          : plan.description}
                      </p>
                      <div className="AP-ListItemMeta">
                        <span><Calendar size={14} /> {plan.duration} weeks</span>
                        <span><DollarSign size={14} /> ${plan.price}</span>
                        <span><Target size={14} /> {plan.targetUserProfile}</span>
                        <span><Clock size={14} /> {plan.followUpFrequency}</span>
                      </div>
                    </div>
                    <div className="AP-ListItemActions">
                      <div className="AP-ListCreatorInfo">
                        {plan.creatorInfo?.photo ? (
                          <img src={plan.creatorInfo.photo} alt={plan.creatorInfo.fullName} className="AP-CreatorAvatar" />
                        ) : (
                          <div className="AP-CreatorAvatarFallback">
                            {plan.creatorInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span>{plan.creatorInfo?.fullName || 'Unknown'}</span>
                      </div>
                      <ChevronRight size={20} className="AP-ListArrow" />
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default AllPlansPage;