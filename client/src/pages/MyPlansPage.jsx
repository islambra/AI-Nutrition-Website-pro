import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
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
  ArrowUpRight,
  TrendingUp,
  Heart,
  Coffee,
  ShoppingBag
} from 'lucide-react';
import { getAllPlans, getPlanCategories } from '../api/planApi';
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
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllPlans();
      if (response.success) {
        setPlans(response.data);
      } else {
        setError('Failed to load plans.');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Connection to the vitality server interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesCategory = activeCategory === 'All Categories' || plan.planCategory === activeCategory;
    const matchesSearch = plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All Categories', ...getPlanCategories()];

  if (loading) {
    return (
      <div className="MPP-LoaderWrapper">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="MPP-LoaderIcon"
        >
          <Target size={60} color="#2D5A27" />
        </motion.div>
        <p>SYNCHRONIZING PLAN DATA</p>
      </div>
    );
  }

  return (
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
            NUTRITIONAL STRATEGY
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="MPP-Title"
          >
            YOUR PERSONALIZED <br /> <span className="MPP-GradientText">VITALITY PLANS</span>
            </motion.h1>

            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="MPP-Controls"
            >
            <div className="MPP-SearchBox">
              <Search size={20} className="MPP-SearchIcon" />
              <input 
                type="text" 
                placeholder="SEARCH ACTIVE PLANS" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="MPP-Filters">
              <div className="MPP-FiltersScroll">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`MPP-FilterBtn ${activeCategory === cat ? 'is-active' : ''}`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="MPP-Content">
        {error ? (
          <div className="MPP-ErrorState">
            <Zap size={40} />
            <h3>SYSTEM SYNC ERROR</h3>
            <p>{error}</p>
            <button onClick={fetchPlans}>REINITIALIZE FEED</button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="MPP-EmptyState">
            <Sparkles size={60} opacity={0.3} />
            <h3>ZERO MATCHES FOUND</h3>
            <p>Your criteria did not match any available vitality blueprints.</p>
          </div>
        ) : (
          <div className="MPP-Grid">
            {filteredPlans.map((plan, index) => (
              <motion.article 
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="MPP-PlanCard"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="MPP-CardImageWrapper">
                  {plan.planImage ? (
                    <img src={plan.planImage} alt={plan.planName} className="MPP-CardImage" />
                  ) : (
                    <div className="MPP-CardPlaceholder">
                      <Target size={60} strokeWidth={1} />
                    </div>
                  )}
                  <div className="MPP-CardTag">
                    <Zap size={14} />
                    <span>{plan.planCategory.toUpperCase()}</span>
                  </div>
                </div>

                <div className="MPP-CardBody">
                  <div className="MPP-CardHeader">
                    <h3 className="MPP-CardTitle">{plan.planName}</h3>
                    <div className="MPP-CardPrice">${plan.price}</div>
                  </div>

                  <p className="MPP-CardExcerpt">
                    {plan.description.length > 100 ? `${plan.description.substring(0, 100)}...` : plan.description}
                  </p>

                  <div className="MPP-CardStats">
                    <div className="MPP-StatItem">
                      <Clock size={14} />
                      <span>{plan.duration} WEEKS</span>
                    </div>
                    <div className="MPP-StatItem">
                      <TrendingUp size={14} />
                      <span>{plan.dailyCalorieRange?.min}-{plan.dailyCalorieRange?.max} KCAL</span>
                    </div>
                    <div className="MPP-StatItem">
                      <Activity size={14} />
                      <span>{plan.mealsPerDay} MEALS/DAY</span>
                    </div>
                  </div>

                  <div className="MPP-CardFooter">
                    <span className="MPP-Author">By {plan.createdBy?.fullName || 'EXPERT'}</span>
                    <button className="MPP-ViewBtn">
                      VIEW DETAILS <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="MPP-CardHoverIndicator">
                  <ArrowUpRight size={20} />
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Plan Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="MPP-ModalOverlay"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="MPP-ModalContent"
              onClick={e => e.stopPropagation()}
            >
              <button className="MPP-ModalClose" onClick={() => setSelectedPlan(null)}>
                <Zap size={20} />
              </button>

              <div className="MPP-ModalGrid">
                <div className="MPP-ModalImageSection">
                  {selectedPlan.planImage ? (
                    <img src={selectedPlan.planImage} alt={selectedPlan.planName} />
                  ) : (
                    <div className="MPP-ModalPlaceholder">
                      <Target size={100} strokeWidth={1} />
                    </div>
                  )}
                  <div className="MPP-ModalPriceBadge">${selectedPlan.price}</div>
                </div>

                <div className="MPP-ModalInfoSection">
                  <div className="MPP-ModalBadge">{selectedPlan.planCategory.toUpperCase()}</div>
                  <h2 className="MPP-ModalTitle">{selectedPlan.planName}</h2>
                  <p className="MPP-ModalAuthor">Designed by {selectedPlan.createdBy?.fullName || 'Nutrition Expert'}</p>
                  
                  <div className="MPP-ModalStatsGrid">
                    <div className="MPP-ModalStatCard">
                      <Clock size={20} />
                      <div>
                        <span className="m-label">DURATION</span>
                        <span className="m-value">{selectedPlan.duration} Weeks</span>
                      </div>
                    </div>
                    <div className="MPP-ModalStatCard">
                      <TrendingUp size={20} />
                      <div>
                        <span className="m-label">CALORIES</span>
                        <span className="m-value">{selectedPlan.dailyCalorieRange?.min}-{selectedPlan.dailyCalorieRange?.max}</span>
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
  );
}

export default MyPlansPage;
