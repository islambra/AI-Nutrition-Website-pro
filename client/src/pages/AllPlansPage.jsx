import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, DollarSign, Target, Users, Clock, 
  Activity, Search, Filter, X, Eye, ChevronRight,
  Heart, Award, Zap, Loader2, SlidersHorizontal,
  Grid3X3, List, TrendingUp, User, Mail, Star,
  ShoppingCart, Info, Check, Sparkles, MessageCircle
} from 'lucide-react';
import { getAllPlans, getPlanCategories } from '../api/planApi';
import { checkPlanOwnership } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';
import { isClient } from '../api/userApi';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import PurchaseModal from './PurchaseModal';
import './AllPlansPage.css';

function AllPlansPage() {
  const { t } = useTranslation();
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
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Loading state for plan ownership check
  const [checkingPlanId, setCheckingPlanId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error(t('checkout.pleaseLogin'));
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
        setError(t('plans.noPlans'));
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort plans
  useEffect(() => {
    let result = [...plans];

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

    if (selectedCategory) {
      result = result.filter(plan => plan.planCategory === selectedCategory);
    }

    if (priceRange.min) {
      result = result.filter(plan => plan.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(plan => plan.price <= Number(priceRange.max));
    }

    if (durationRange.min) {
      result = result.filter(plan => plan.duration >= Number(durationRange.min));
    }
    if (durationRange.max) {
      result = result.filter(plan => plan.duration <= Number(durationRange.max));
    }

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

  // Handle plan selection with ownership check
  const handleSelectPlan = async (plan, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(t('checkout.pleaseLogin'));
      navigate('/login');
      return;
    }

    if (!isClient(user)) {
      toast.error(t('plans.noPlans'));
      return;
    }

    setCheckingPlanId(plan._id);
    try {
      const response = await checkPlanOwnership(plan._id);
      if (response.success && response.ownsPlan) {
        toast.error(t('plans.owned'), {
          duration: 4000,
          icon: ' '
        });
        return;
      }
      if (response.success && response.hasPendingPayment) {
        toast.error(t('plans.pendingPayment') || 'You already have a pending payment request for this plan', {
          duration: 4000,
          icon: ' '
        });
        return;
      }
      // If not owned, proceed to checkout
      navigate(`/checkout/plan/${plan._id}`, { state: { plan } });
    } catch (err) {
      console.error('Error checking plan ownership:', err);
      toast.error(t('common.error'));
    } finally {
      setCheckingPlanId(null);
    }
  };

  const handlePlanClick = (plan, e) => {
    e.stopPropagation();
    // Reuse the same logic
    handleSelectPlan(plan, e);
  };

  const handleBuyNow = () => {
    setModalOpen(false);
    if (selectedPlan) {
      handleSelectPlan(selectedPlan, new Event('click'));
    }
  };

  const handleViewMyPlan = () => {
    setModalOpen(false);
    navigate('/my-plans');
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

  if (authLoading || (loading && plans.length === 0)) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

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
                {t('plans.title')}
              </h1>
              <p className="AP-Subtitle">
                {t('services.noPlans')}
              </p>
            </ScrollReveal>

            {/* Search and Controls */}
            <div className="AP-Controls">
              <div className="AP-SearchBar">
                <Search size={20} className="AP-SearchIcon" />
                <input
                  type="text"
                  placeholder={t('plans.searchPlaceholder')}
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
                  {t('common.search')}
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
                    <div className="AP-FilterGroup">
                        <label>{t('common.all')}</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                          <option value="">{t('common.all')}</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="AP-FilterGroup">
                        <label>{t('services.currency')}</label>
                      <div className="AP-RangeInputs">
                        <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} />
                      </div>
                    </div>
                    <div className="AP-FilterGroup">
                        <label>{t('signup.durationWeeks')}</label>
                      <div className="AP-RangeInputs">
                        <input type="number" placeholder="Min" value={durationRange.min} onChange={(e) => setDurationRange(prev => ({ ...prev, min: e.target.value }))} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={durationRange.max} onChange={(e) => setDurationRange(prev => ({ ...prev, max: e.target.value }))} />
                      </div>
                    </div>
                    <div className="AP-FilterGroup">
                        <label>{t('common.search')}</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                          <option value="newest">{t('common.pending')}</option>
                          <option value="oldest">{t('common.approved')}</option>
                          <option value="price-low">{t('profile.healthMetrics')}</option>
                          <option value="price-high">{t('profile.healthMetrics')}</option>
                          <option value="duration">{t('signup.durationWeeks')}</option>
                          <option value="name">{t('common.search')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="AP-FilterActions">
                    <button onClick={clearFilters} className="AP-ClearFiltersBtn">
                      <X size={16} /> {t('common.noResults')}
                    </button>
                    <span className="AP-ResultsCount">
                      {t('common.noResults')}
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
              <button onClick={fetchPlans}>{t('common.tryAgain')}</button>
            </div>
          )}

          {/* Plans Grid/List */}
          {filteredPlans.length === 0 ? (
            <div className="AP-EmptyState">
              <Search size={64} />
              <h2>{t('plans.noPlans')}</h2>
              <p>{t('common.noResults')}</p>
              <button onClick={clearFilters} className="AP-ClearFiltersBtn">{t('common.cancel')}</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="AP-Grid">
              {filteredPlans.map((plan, index) => (
                <ScrollReveal key={plan._id} delay={index * 0.05}>
                  <motion.div
                    className="AP-Card"
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="AP-CardImage">
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} />
                      ) : (
                        <div className="AP-CardImagePlaceholder">
                          <Target size={40} />
                        </div>
                      )}
                      <div className="AP-CategoryBadge" style={{ backgroundColor: getCategoryColor(plan.planCategory) }}>
                        {plan.planCategory}
                      </div>
                    </div>
                    <div className="AP-CardContent">
                      <h3 className="AP-CardTitle">{plan.planName}</h3>
                      <p className="AP-CardDescription">
                        {plan.description?.length > 100 ? `${plan.description.substring(0, 100)}...` : plan.description}
                      </p>
                      <div className="AP-CardMeta">
                        <span><Calendar size={14} /> {plan.duration} weeks</span>
                        <span><DollarSign size={14} /> {plan.price.toLocaleString()} DZD</span>
                        <span><MessageCircle size={14} /> {plan.consultationIncluded} Sessions</span>
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
                          <span className="AP-CreatorName">{plan.creatorInfo?.fullName || 'Unknown'}</span>
                        </div>
                        <button
                          onClick={(e) => handleSelectPlan(plan, e)}
                          className="AP-ViewPlanBtn"
                          disabled={checkingPlanId === plan._id}
                        >
                          {checkingPlanId === plan._id ? (
                            <Loader2 size={16} className="AP-Spin" />
                          ) : (
                            <>
                              <ShoppingCart size={16} /> {t('plans.buyNow')} <ChevronRight size={16} />
                            </>
                          )}
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
                  <motion.div className="AP-ListItem" whileHover={{ x: 4 }}>
                    <div className="AP-ListItemImage">
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} />
                      ) : (
                        <div className="AP-CardImagePlaceholder"><Target size={28} /></div>
                      )}
                    </div>
                    <div className="AP-ListItemContent">
                      <div className="AP-ListItemHeader">
                        <h3>{plan.planName}</h3>
                        <span className="AP-ListCategoryBadge" style={{ backgroundColor: getCategoryColor(plan.planCategory) }}>
                          {plan.planCategory}
                        </span>
                      </div>
                      <p className="AP-ListItemDescription">
                        {plan.description?.length > 120 ? `${plan.description.substring(0, 120)}...` : plan.description}
                      </p>
                      <div className="AP-ListItemMeta">
                        <span><Calendar size={14} /> {plan.duration} weeks</span>
                        <span><DollarSign size={14} /> {plan.price.toLocaleString()} DZD</span>
                        <span><MessageCircle size={14} /> {plan.consultationIncluded} Sessions</span>
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
                      <button
                        onClick={(e) => handleSelectPlan(plan, e)}
                        className="AP-ViewPlanBtn"
                        disabled={checkingPlanId === plan._id}
                      >
                        {checkingPlanId === plan._id ? (
                          <Loader2 size={16} className="AP-Spin" />
                        ) : (
                          <>
                            <ShoppingCart size={16} /> {t('plans.buyNow')}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
        onBuyNow={handleBuyNow}
        onViewMyPlan={handleViewMyPlan}
      />
    </PageTransition>
  );
}

export default AllPlansPage;