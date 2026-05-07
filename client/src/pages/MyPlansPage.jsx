// pages/MyPlansPage.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  DollarSign, 
  Clock, 
  Target, 
  Activity, 
  ChevronRight, 
  Info,
  Leaf,
  Sparkles,
  Zap,
  TrendingUp,
  Heart,
  Coffee,
  ShoppingBag,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserPlans } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './MyPlansPage.css';

const PlansOrganicFloaters = memo(() => (
  <div className="MPP-OrganicContainer">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="MPP-Floater"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.1, 0], 
          x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
          y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
        }}
        transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "linear" }}
      >
        <Leaf size={40 + i * 20} strokeWidth={1} />
      </motion.div>
    ))}
  </div>
));

function MyPlansPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserPlan, setSelectedUserPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view your plans');
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchUserPlans();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserPlans = async () => {
    try {
      setLoading(true);
      const response = await getUserPlans();
      if (response.success) {
        setUserPlans(response.data || []);
      } else {
        toast.error('Failed to load your plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = (userPlan) => {
    setSelectedUserPlan(userPlan);
    setSelectedPlan(userPlan.plan);
  };

  const closeModal = () => {
    setSelectedUserPlan(null);
    setSelectedPlan(null);
  };

  const filteredPlans = userPlans.filter(userPlan => {
    const planName = userPlan.plan?.planName?.toLowerCase() || '';
    const category = userPlan.plan?.planCategory?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return planName.includes(query) || category.includes(query);
  });

  if (authLoading || loading) {
    return (
      <div className="MPP-LoaderWrapper">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="MPP-LoaderIcon"
        >
          <Target size={60} color="#2D5A27" />
        </motion.div>
        <p>LOADING YOUR PLANS</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="MPP-MainWrapper">
        <PlansOrganicFloaters />
        <div className="MPP-GridOverlay" />

        <header className="MPP-Hero">
          <div className="MPP-HeroContent">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="MPP-Badge"
            >
              MY PURCHASED PLANS
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="MPP-Title"
            >
              YOUR <span className="MPP-GradientText">NUTRITION</span> <br /> JOURNEY
            </motion.h1>

            {userPlans.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="MPP-SearchBox"
              >
                <Search size={20} className="MPP-SearchIcon" />
                <input 
                  type="text" 
                  placeholder="SEARCH YOUR PLANS" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            )}
          </div>
        </header>

        <main className="MPP-Content">
          {userPlans.length === 0 ? (
            <motion.div 
              className="MPP-EmptyState"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={64} opacity={0.3} />
              <h3>NO PLANS PURCHASED YET</h3>
              <p>Browse our nutrition plans and start your health journey today!</p>
              <button onClick={() => navigate('/allPlans')} className="MPP-BrowseBtn">
                Browse Plans <ArrowRight size={18} />
              </button>
            </motion.div>
          ) : filteredPlans.length === 0 ? (
            <div className="MPP-EmptyState">
              <Search size={48} opacity={0.3} />
              <h3>NO MATCHING PLANS</h3>
              <p>Try a different search term</p>
            </div>
          ) : (
            <div className="MPP-Grid">
              {filteredPlans.map((userPlan, index) => (
                <motion.article 
                  key={userPlan._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="MPP-PlanCard"
                  onClick={() => handlePlanClick(userPlan)}
                >
                  <div className="MPP-CardImageWrapper">
                    {userPlan.plan?.planImage ? (
                      <img src={userPlan.plan.planImage} alt={userPlan.plan.planName} className="MPP-CardImage" />
                    ) : (
                      <div className="MPP-CardPlaceholder">
                        <Target size={60} strokeWidth={1} />
                      </div>
                    )}
                    <div className="MPP-StatusBadge">
                      <CheckCircle size={14} />
                      <span>ACTIVE</span>
                    </div>
                  </div>

                  <div className="MPP-CardBody">
                    <div className="MPP-CardHeader">
                      <h3 className="MPP-CardTitle">{userPlan.plan?.planName || 'Nutrition Plan'}</h3>
                      <span className="MPP-CardCategory">{userPlan.plan?.planCategory || 'Plan'}</span>
                    </div>

                    <p className="MPP-CardExcerpt">
                      {userPlan.plan?.description?.substring(0, 100) || 'No description'}...
                    </p>

                    {/* Sessions Highlight */}
                    <div className="MPP-SessionsHighlight">
                      <MessageCircle size={20} />
                      <div>
                        <span className="MPP-SessionsLabel">Sessions Remaining</span>
                        <span className="MPP-SessionsCount">{userPlan.sessionsRemaining}</span>
                      </div>
                    </div>

                    <div className="MPP-CardStats">
                      <div className="MPP-StatItem">
                        <Calendar size={14} />
                        <span>{userPlan.plan?.duration} DAYS</span>
                      </div>
                      <div className="MPP-StatItem">
                        <Activity size={14} />
                        <span>{userPlan.plan?.followUpFrequency?.toUpperCase()}</span>
                      </div>
                      <div className="MPP-StatItem">
                        <Clock size={14} />
                        <span>{userPlan.plan?.mealsPerDay} MEALS/DAY</span>
                      </div>
                    </div>

                    <div className="MPP-CardFooter">
                      <span className="MPP-PurchaseDate">
                        Purchased: {new Date(userPlan.purchasedAt).toLocaleDateString()}
                      </span>
                      <button className="MPP-ViewBtn">
                        VIEW DETAILS <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="MPP-CardHoverIndicator">
                    <ChevronRight size={20} />
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </main>

        {/* Plan Details Modal */}
        <AnimatePresence>
          {selectedPlan && selectedUserPlan && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="MPP-ModalOverlay"
              onClick={closeModal}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="MPP-ModalContent"
                onClick={e => e.stopPropagation()}
              >
                <button className="MPP-ModalClose" onClick={closeModal}>
                  <Zap size={20} />
                </button>

                {/* Session Info Banner */}
                <div className="MPP-SessionBanner">
                  <div className="MPP-SessionBannerItem">
                    <MessageCircle size={20} />
                    <div>
                      <span className="sb-label">SESSIONS REMAINING</span>
                      <span className="sb-value">{selectedUserPlan.sessionsRemaining}</span>
                    </div>
                  </div>
                  <div className="MPP-SessionBannerItem">
                    <Calendar size={20} />
                    <div>
                      <span className="sb-label">PURCHASED</span>
                      <span className="sb-value">{new Date(selectedUserPlan.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="MPP-SessionBannerItem">
                    <DollarSign size={20} />
                    <div>
                      <span className="sb-label">PRICE</span>
                      <span className="sb-value">${selectedUserPlan.price || selectedPlan.price || 0}</span>
                    </div>
                  </div>
                  <div className="MPP-SessionBannerItem">
                    <CreditCard size={20} />
                    <div>
                      <span className="sb-label">PAYMENT</span>
                      <span className="sb-value">
                        {selectedUserPlan.payment?.paymentMethod?.replace('_', ' ').toUpperCase() || 'Card'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creator Info Banner */}
                <div className="MPP-CreatorBanner">
                  {selectedPlan.creatorInfo?.photo ? (
                    <img src={selectedPlan.creatorInfo.photo} alt={selectedPlan.creatorInfo.fullName} className="MPP-CreatorAvatar" />
                  ) : (
                    <div className="MPP-CreatorAvatarFallback">
                      {selectedPlan.creatorInfo?.fullName?.charAt(0)?.toUpperCase() || 'N'}
                    </div>
                  )}
                  <div className="MPP-CreatorBannerInfo">
                    <span className="cb-label">CREATED BY</span>
                    <span className="cb-name">{selectedPlan.creatorInfo?.fullName || 'Nutrition Expert'}</span>
                    <span className="cb-role">{selectedPlan.creatorInfo?.role || 'Nutritionist'}</span>
                  </div>
                  {selectedPlan.creatorInfo?.email && (
                    <div className="MPP-CreatorContact">
                      <span className="cb-email">{selectedPlan.creatorInfo.email}</span>
                    </div>
                  )}
                </div>

                <div className="MPP-ModalGrid">
                  <div className="MPP-ModalImageSection">
                    {selectedPlan.planImage ? (
                      <img src={selectedPlan.planImage} alt={selectedPlan.planName} />
                    ) : (
                      <div className="MPP-ModalPlaceholder">
                        <Target size={100} strokeWidth={1} />
                      </div>
                    )}
                    <div className="MPP-ModalPriceBadge">
                      ${selectedUserPlan.price || selectedPlan.price || 0}
                    </div>
                  </div>

                  <div className="MPP-ModalInfoSection">
                    <div className="MPP-ModalBadge">{selectedPlan.planCategory?.toUpperCase()}</div>
                    <h2 className="MPP-ModalTitle">{selectedPlan.planName}</h2>
                    <p className="MPP-ModalAuthor">
                      Designed by {selectedPlan.creatorInfo?.fullName || 'Nutrition Expert'}
                    </p>
                    
                    <div className="MPP-ModalStatsGrid">
                      <div className="MPP-ModalStatCard">
                        <Clock size={20} />
                        <div>
                          <span className="m-label">DURATION</span>
                          <span className="m-value">{selectedPlan.duration} Days</span>
                        </div>
                      </div>
                      <div className="MPP-ModalStatCard">
                        <MessageCircle size={20} />
                        <div>
                          <span className="m-label">CONSULTATIONS</span>
                          <span className="m-value">{selectedPlan.consultationIncluded} Total</span>
                        </div>
                      </div>
                      <div className="MPP-ModalStatCard">
                        <Activity size={20} />
                        <div>
                          <span className="m-label">MEALS</span>
                          <span className="m-value">{selectedPlan.mealsPerDay} per Day</span>
                        </div>
                      </div>
                    </div>

                    <div className="MPP-ModalDescription">
                      <h3><Info size={18} /> OVERVIEW</h3>
                      <p>{selectedPlan.description}</p>
                    </div>

                    <div className="MPP-ModalMacros">
                      <h3><Zap size={18} /> MACRONUTRIENT RATIO</h3>
                      <div className="MPP-MacroBars">
                        <div className="MPP-MacroBar">
                          <div className="MPP-BarInfo"><span>CARBS</span><span>{selectedPlan.macronutrientRatio?.carbs}%</span></div>
                          <div className="MPP-BarTrack"><motion.div initial={{width: 0}} animate={{width: `${selectedPlan.macronutrientRatio?.carbs}%`}} className="MPP-BarFill carbs" /></div>
                        </div>
                        <div className="MPP-MacroBar">
                          <div className="MPP-BarInfo"><span>PROTEIN</span><span>{selectedPlan.macronutrientRatio?.protein}%</span></div>
                          <div className="MPP-BarTrack"><motion.div initial={{width: 0}} animate={{width: `${selectedPlan.macronutrientRatio?.protein}%`}} className="MPP-BarFill protein" /></div>
                        </div>
                        <div className="MPP-MacroBar">
                          <div className="MPP-BarInfo"><span>FATS</span><span>{selectedPlan.macronutrientRatio?.fat}%</span></div>
                          <div className="MPP-BarTrack"><motion.div initial={{width: 0}} animate={{width: `${selectedPlan.macronutrientRatio?.fat}%`}} className="MPP-BarFill fats" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="MPP-ModalDetailsGrid">
                  <div className="MPP-DetailSection">
                    <h3><Heart size={18} /> RECOMMENDED FOODS</h3>
                    <div className="MPP-Tags">
                      {selectedPlan.recommendedFoods?.map((food, i) => <span key={i} className="MPP-Tag is-positive">{food}</span>)}
                    </div>
                  </div>
                  <div className="MPP-DetailSection">
                    <h3><Zap size={18} /> FOODS TO AVOID</h3>
                    <div className="MPP-Tags">
                      {selectedPlan.foodsToAvoid?.map((food, i) => <span key={i} className="MPP-Tag is-negative">{food}</span>)}
                    </div>
                  </div>
                  <div className="MPP-DetailSection is-full">
                    <h3><Coffee size={18} /> MEAL STRUCTURE</h3>
                    <div className="MPP-MealGrid">
                      {Object.entries(selectedPlan.mealStructure || {}).map(([meal, items]) => (
                        <div key={meal} className="MPP-MealCard">
                          <h4>{meal}</h4>
                          <ul>
                            {items.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedPlan.weeklyGroceryList && (
                    <div className="MPP-DetailSection is-full">
                      <h3><ShoppingBag size={18} /> WEEKLY GROCERY LIST</h3>
                      <div className="MPP-GroceryGrid">
                        {Object.entries(selectedPlan.weeklyGroceryList).map(([cat, items]) => (
                          items && items.length > 0 && (
                            <div key={cat} className="MPP-GroceryCat">
                              <h4>{cat.toUpperCase()}</h4>
                              <p>{items.join(', ')}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default MyPlansPage;