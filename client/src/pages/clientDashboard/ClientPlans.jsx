import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, MessageCircle, Video, Calendar, Eye,
  ArrowRight, Trash2, X, Loader2, AlertCircle, Sparkles,
  Clock, User, CreditCard, Activity, FileText, Zap,
  ChevronDown, ChevronUp
} from "lucide-react";
import { getUserPlans } from "../../api/paymentApi";
import {
  bookConsultation,
  getUserConsultations,
  cancelConsultation,
  deleteConsultation,
} from "../../api/consultationApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "../../components/ScrollReveal";
import { useTranslation, Trans } from 'react-i18next';
import "./ClientPlans.css";

function ClientPlans() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("plans");

  // Plans state
  const [userPlans, setUserPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Bookings state
  const [allConsultations, setAllConsultations] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Booking modal
  const [bookingModal, setBookingModal] = useState({ open: false, userPlanId: null });
  const [bookingDateTime, setBookingDateTime] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: "", onConfirm: null });

  // Selected plan detail modal
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchUserPlans();
    fetchAllConsultationsForUser();
  }, []);

  const fetchUserPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await getUserPlans();
      if (res.success) setUserPlans(res.data || []);
    } catch (err) {
      toast.error(t('dashboard.dieteticien.myPlans.loadFailed'));
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchAllConsultationsForUser = async () => {
    try {
      setBookingsLoading(true);
      const res = await getUserConsultations();
      if (res.success) setAllConsultations(res.data || []);
    } catch (err) {
      toast.error(t('clientPlans.failedLoadBookings'));
    } finally {
      setBookingsLoading(false);
    }
  };

  const openBookingModal = (userPlanId) => {
    setBookingModal({ open: true, userPlanId });
    setBookingDateTime("");
    setBookingNote("");
  };

  const handleBookNow = async () => {
    if (!bookingDateTime) return toast.error(t('clientPlans.selectDateTime'));
    setBookingLoading(true);
    try {
      await bookConsultation(
        bookingModal.userPlanId,
        new Date(bookingDateTime).toISOString(),
        bookingNote
      );
      toast.success(t('clientPlans.bookedSuccess'));
      setBookingModal({ open: false, userPlanId: null });
      fetchUserPlans();
      fetchAllConsultationsForUser();
    } catch (err) {
      toast.error(err.response?.data?.message || t('clientPlans.bookingFailed'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (consultationId) => {
    setConfirmDialog({
      open: true,
      message: t('clientPlans.cancelConfirm'),
      onConfirm: async () => {
        try {
          await cancelConsultation(consultationId);
          toast.success(t('clientPlans.cancelSuccess'));
          fetchUserPlans();
          fetchAllConsultationsForUser();
        } catch (err) {
          toast.error(err.response?.data?.message || t('clientPlans.cancelError'));
        }
      }
    });
  };

  const handleDeleteConsultation = async (consultationId) => {
    setConfirmDialog({
      open: true,
      message: t('clientPlans.deleteConfirm'),
      onConfirm: async () => {
        try {
          await deleteConsultation(consultationId);
          toast.success(t('clientPlans.deleteSuccess'));
          fetchAllConsultationsForUser();
        } catch (err) {
          toast.error(err.response?.data?.message || t('clientPlans.deleteError'));
        }
      }
    });
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const CountdownTimer = ({ targetDate }) => {
    const diff = new Date(targetDate).getTime() - now;
    if (diff <= 0) return <span className="aff-countdown-live">{t('clientPlans.liveNow')}</span>;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return <span>{t('clientPlans.countdownDays', { d, h, m })}</span>;
    if (h > 0) return <span>{t('clientPlans.countdownHours', { h, m, s })}</span>;
    return <span>{t('clientPlans.countdownMinutes', { m, s })}</span>;
  };

  return (
    <div className="aff-wrapper">
      {/* Header */}
      <ScrollReveal>
        <div className="aff-header">
          <div className="aff-header-badge">
            <Sparkles size={16} />
            <span>{t('dashboard.client.badge')}</span>
          </div>
          <h1 className="aff-title">
            {t('dashboard.client.myPlans')}
          </h1>
          <p className="aff-subtitle">
            {t('dashboard.client.myPlansDesc')}
          </p>
        </div>
      </ScrollReveal>

      {/* Section Tabs */}
      <div className="aff-tabs">
        <button
          className={`aff-tab ${activeSection === "plans" ? "active" : ""}`}
          onClick={() => setActiveSection("plans")}
        >
          <ShoppingBag size={18} />
          {t('dashboard.client.myPlans')}
          {userPlans.length > 0 && (
            <span className="aff-tab-count">{userPlans.length}</span>
          )}
        </button>
        <button
          className={`aff-tab ${activeSection === "bookings" ? "active" : ""}`}
          onClick={() => setActiveSection("bookings")}
        >
          <Eye size={18} />
          {t('clientPlans.myBookings')}
          {allConsultations.length > 0 && (
            <span className="aff-tab-count">{allConsultations.length}</span>
          )}
        </button>
      </div>

      {/* Plans Section */}
      {activeSection === "plans" && (
        <div className="aff-section">
          {plansLoading ? (
            <div className="aff-loading">
              <Loader2 className="aff-spin" size={40} />
              <p>{t('common.loading')}</p>
            </div>
          ) : userPlans.length === 0 ? (
            <div className="aff-empty">
              <ShoppingBag size={60} opacity={0.3} />
              <h3>{t('common.noResults')}</h3>
              <p>{t('common.noResults')}</p>
              <button className="aff-browse-btn" onClick={() => navigate("/allPlans")}>
                {t('dashboard.client.goToPlans')}
              </button>
            </div>
          ) : (
            <div className="aff-plans-grid">
              {userPlans.map((userPlan) => {
                const plan = userPlan.plan || {};
                return (
                  <motion.div
                    key={userPlan._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="aff-plan-card"
                  >
                    <div className="aff-plan-card-inner" onClick={() => setSelectedPlan(userPlan)}>
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} className="aff-plan-image" />
                      ) : (
                        <div className="aff-plan-image-placeholder">
                          <ShoppingBag size={36} />
                        </div>
                      )}
                      <div className="aff-plan-body">
                        <div className="aff-plan-header">
                          <div>
                            <h3 className="aff-plan-name">{plan.planName || t('clientPlans.nutritionPlan')}</h3>
                            <span className="aff-plan-category">{plan.planCategory}</span>
                          </div>
                          <div className="aff-sessions-badge">
                            <MessageCircle size={14} />
                            <Trans i18nKey="clientPlans.sessionRemaining" values={{count: userPlan.sessionsRemaining}} />
                          </div>
                        </div>
                        <p className="aff-plan-desc">
                          {plan.description?.substring(0, 120)}
                          {plan.description?.length > 120 ? "..." : ""}
                        </p>
                        <div className="aff-plan-meta">
                          <span><Clock size={14} /> {plan.duration || "—"} {t('services.weeks')}</span>
                          <span><Activity size={14} /> {plan.mealsPerDay || "—"} {t('clientPlans.mealsPerDay')}</span>
                        </div>
                        <div className="aff-plan-footer">
                          <span className="aff-plan-date">
                            <Trans i18nKey="clientPlans.purchased" values={{date: new Date(userPlan.purchasedAt).toLocaleDateString()}} />
                          </span>
                          {userPlan.sessionsRemaining > 0 && (
                            <button
                              className="aff-book-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openBookingModal(userPlan._id);
                              }}
                            >
                              <Video size={14} /> {t('clientPlans.bookSession')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bookings Section */}
      {activeSection === "bookings" && (
        <div className="aff-section">
          {bookingsLoading ? (
            <div className="aff-loading">
              <Loader2 className="aff-spin" size={40} />
              <p>{t('common.loading')}</p>
            </div>
          ) : allConsultations.length === 0 ? (
            <div className="aff-empty">
              <Eye size={60} opacity={0.3} />
              <h3>{t('common.noResults')}</h3>
              <p>{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="aff-bookings-list">
              {allConsultations.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aff-booking-card"
                >
                  <div className="aff-booking-header">
                    <div>
                      <h4>{booking.plan?.planName || t('clientPlans.myBookings')}</h4>
                      <span className="aff-booking-category">
                        {booking.plan?.planCategory || t('clientPlans.na')}
                      </span>
                    </div>
                    <span className={`aff-status-badge aff-${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="aff-booking-details">
                    <div className="aff-booking-detail">
                      <Calendar size={14} />
                      <span>
                        {new Date(booking.requestedDateTime).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="aff-booking-detail">
                      <ShoppingBag size={14} />
                      <span>
                        {t('clientPlans.planLabel')} <strong>{booking.plan?.planName || t('clientPlans.na')}</strong>
                      </span>
                    </div>
                    {booking.userPlan?.sessionsRemaining !== undefined && (
                      <div className="aff-booking-detail">
                        <MessageCircle size={14} />
                        <span>
                          <Trans i18nKey="clientPlans.sessionRemaining" values={{count: booking.userPlan.sessionsRemaining}} />
                        </span>
                      </div>
                    )}
                    {booking.note && (
                      <div className="aff-booking-detail">
                        <FileText size={14} />
                        <span>{booking.note}</span>
                      </div>
                    )}
                  </div>

                  {booking.status === "accepted" && (
                    <div className="aff-booking-countdown">
                      <Clock size={14} />
                      <CountdownTimer targetDate={booking.requestedDateTime} />
                    </div>
                  )}

                  {booking.status === "accepted" && booking.zoomLink && now >= new Date(booking.requestedDateTime).getTime() && (
                    <a
                      href={booking.zoomLink}
                      target="_blank"
                      rel="noreferrer"
                      className="aff-zoom-link"
                    >
                      <Video size={14} /> {t('clientPlans.joinZoom')}
                    </a>
                  )}

                  <div className="aff-booking-actions">
                    {booking.status === "pending" && (
                      <button
                        className="aff-cancel-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        <Trash2 size={14} /> {t('clientPlans.cancelBooking')}
                      </button>
                    )}
                    {booking.status !== "pending" && (
                      <button
                        className="aff-delete-btn"
                        onClick={() => handleDeleteConsultation(booking._id)}
                      >
                        <Trash2 size={14} /> {t('clientPlans.deleteRecord')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plan Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="aff-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              className="aff-plan-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="aff-modal-close" onClick={() => setSelectedPlan(null)}>
                <X size={20} />
              </button>
              {(() => {
                const plan = selectedPlan.plan || {};
                const userPlan = selectedPlan;
                const macro = plan.macronutrientRatio || {};
                const creator = plan.creatorInfo || plan.createdBy || {};
                const grocery = plan.weeklyGroceryList || {};
                const meals = plan.mealStructure || {};
                const calRange = plan.dailyCalorieRange || {};
                return (
                  <>
                    <div className="aff-modal-hero">
                      {plan.planImage ? (
                        <img src={plan.planImage} alt={plan.planName} className="aff-modal-img" />
                      ) : (
                        <div className="aff-modal-img-placeholder">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                      <div className="aff-modal-hero-overlay">
                        <span className="aff-modal-price">{plan.price ? `${plan.price} DZD` : "—"}</span>
                        <span className="aff-modal-category">{plan.planCategory}</span>
                      </div>
                    </div>
                    <div className="aff-modal-body">

                      {/* Session Banner */}
                      <div className="aff-modal-session-banner">
                        <MessageCircle size={16} />
                        <Trans i18nKey="clientPlans.sessionRemaining" values={{count: userPlan.sessionsRemaining}} />
                        <span className="aff-modal-sep">|</span>
                        <Trans i18nKey="clientPlans.purchased" values={{date: new Date(userPlan.purchasedAt).toLocaleDateString()}} />
                      </div>

                      <h2 className="aff-modal-title">{plan.planName}</h2>

                      {/* Creator */}
                      {creator.fullName && (
                        <div className="aff-modal-creator">
                          {creator.photo ? (
                            <img src={creator.photo} alt={creator.fullName} className="aff-creator-avatar" />
                          ) : (
                            <div className="aff-creator-avatar-placeholder"><User size={16} /></div>
                          )}
                          <div>
                            <strong>{creator.fullName}</strong>
                            {creator.role && <span className="aff-creator-role">{creator.role}</span>}
                            {creator.email && <span className="aff-creator-email">{creator.email}</span>}
                          </div>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="aff-modal-stats">
                        <div className="aff-modal-stat">
                          <Clock size={18} />
                          <span>{plan.duration || "—"} {t('services.weeks')}</span>
                        </div>
                        <div className="aff-modal-stat">
                          <AlertCircle size={18} />
                          <Trans i18nKey="clientPlans.consultationsIncluded" values={{count: plan.consultationIncluded || 0}} />
                        </div>
                        <div className="aff-modal-stat">
                          <Activity size={18} />
                          <span>{plan.mealsPerDay || "—"} {t('clientPlans.mealsPerDay')}</span>
                        </div>
                        {calRange.min && (
                          <div className="aff-modal-stat">
                            <Zap size={18} />
                            <span>{calRange.min}-{calRange.max} {t('clientPlans.cal')}</span>
                          </div>
                        )}
                        {plan.followUpFrequency && plan.followUpFrequency !== "None" && (
                          <div className="aff-modal-stat">
                            <MessageCircle size={18} />
                            <span>{plan.followUpFrequency}</span>
                          </div>
                        )}
                        {plan.targetUserProfile && (
                          <div className="aff-modal-stat">
                            <User size={18} />
                            <span>{plan.targetUserProfile}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {plan.description && (
                        <div className="aff-modal-desc">
                          <h4>{t('dashboard.dieteticien.createPlan.description')}</h4>
                          <p>{plan.description}</p>
                        </div>
                      )}

                      {/* Macronutrient Ratio */}
                      {(macro.carbs !== undefined || macro.protein !== undefined || macro.fat !== undefined) && (
                        <div className="aff-modal-macros">
                          <h4>{t('clientPlans.macroRatio')}</h4>
                          <div className="aff-modal-macro-bars">
                            <div className="aff-modal-macro">
                              <span className="aff-modal-macro-label">{t('clientPlans.macroCarbs')} {macro.carbs || 0}%</span>
                              <div className="aff-modal-macro-track">
                                <div className="aff-modal-macro-fill carbs" style={{ width: `${macro.carbs || 0}%` }} />
                              </div>
                            </div>
                            <div className="aff-modal-macro">
                              <span className="aff-modal-macro-label">{t('clientPlans.macroProtein')} {macro.protein || 0}%</span>
                              <div className="aff-modal-macro-track">
                                <div className="aff-modal-macro-fill protein" style={{ width: `${macro.protein || 0}%` }} />
                              </div>
                            </div>
                            <div className="aff-modal-macro">
                              <span className="aff-modal-macro-label">{t('clientPlans.macroFat')} {macro.fat || 0}%</span>
                              <div className="aff-modal-macro-track">
                                <div className="aff-modal-macro-fill fats" style={{ width: `${macro.fat || 0}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommended Foods */}
                      {plan.recommendedFoods?.length > 0 && (
                        <div className="aff-modal-tags">
                          <h4>{t('clientPlans.recommendedFoods')}</h4>
                          <div className="aff-tag-list">
                            {plan.recommendedFoods.map((f, i) => (
                              <span key={i} className="aff-tag aff-tag-green">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Foods to Avoid */}
                      {plan.foodsToAvoid?.length > 0 && (
                        <div className="aff-modal-tags">
                          <h4>{t('clientPlans.foodsToAvoid')}</h4>
                          <div className="aff-tag-list">
                            {plan.foodsToAvoid.map((f, i) => (
                              <span key={i} className="aff-tag aff-tag-red">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meal Structure */}
                      {Object.keys(meals).length > 0 && (
                        <div className="aff-modal-meals">
                          <h4>{t('clientPlans.mealStructure')}</h4>
                          {Object.entries(meals).map(([meal, items]) => (
                            <div key={meal} className="aff-meal-group">
                              <h5><span className="aff-meal-badge">{meal}</span></h5>
                              <ul className="aff-meal-items">
                                {(Array.isArray(items) ? items : []).map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Weekly Grocery List */}
                      {Object.values(grocery).some(arr => arr?.length > 0) && (
                        <div className="aff-modal-grocery">
                          <h4>{t('clientPlans.weeklyGroceryList')}</h4>
                          <div className="aff-grocery-grid">
                            {Object.entries(grocery).map(([cat, items]) =>
                              items?.length > 0 ? (
                                <div key={cat} className="aff-grocery-cat">
                                  <h5 className="aff-grocery-cat-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>
                                  <ul>
                                    {items.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}

                      {/* Supplements */}
                      {plan.supplementsSuggested?.length > 0 && (
                        <div className="aff-modal-supplements">
                          <h4>{t('clientPlans.supplementsSuggested')}</h4>
                          <div className="aff-tag-list">
                            {plan.supplementsSuggested.map((s, i) => (
                              <span key={i} className="aff-tag aff-tag-blue">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exercise Recommendation */}
                      {plan.exerciseRecommendation && (
                        <div className="aff-modal-exercise">
                          <h4>{t('clientPlans.exerciseRecommendation')}</h4>
                          <p>{plan.exerciseRecommendation}</p>
                        </div>
                      )}

                      {/* Book Button */}
                      {userPlan.sessionsRemaining > 0 && (
                        <button
                          className="aff-modal-book-btn"
                          onClick={() => {
                            setSelectedPlan(null);
                            openBookingModal(userPlan._id);
                          }}
                        >
                          <Video size={18} /> {t('clientPlans.bookConsultationTitle')}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModal.open && (
          <motion.div
            className="aff-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookingModal({ open: false, userPlanId: null })}
          >
            <motion.div
              className="aff-booking-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="aff-modal-close"
                onClick={() => setBookingModal({ open: false, userPlanId: null })}
              >
                <X size={20} />
              </button>
              <h3>{t('clientPlans.bookConsultationTitle')}</h3>
              <p className="aff-booking-subtext">
                {t('clientPlans.bookConsultationDesc')}
              </p>
              <div className="aff-form-group">
                <label>{t('clientPlans.dateTimeLabel')}</label>
                <input
                  type="datetime-local"
                  value={bookingDateTime}
                  onChange={(e) => setBookingDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="aff-form-group">
                <label>{t('clientPlans.noteOptional')}</label>
                <textarea
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder={t('clientPlans.notePlaceholder')}
                  rows={3}
                />
              </div>
              <div className="aff-booking-actions">
                <button
                  className="aff-booking-cancel"
                  onClick={() => setBookingModal({ open: false, userPlanId: null })}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="aff-booking-confirm"
                  onClick={handleBookNow}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <Loader2 size={18} className="aff-spin" />
                  ) : (
                    t('clientPlans.confirmBooking')
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.open && (
          <motion.div
            className="aff-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDialog({ open: false, message: "", onConfirm: null })}
          >
            <motion.div
              className="aff-confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aff-confirm-icon">
                <AlertCircle size={28} />
              </div>
              <h3>{t('common.confirm')}</h3>
              <p>{confirmDialog.message}</p>
              <div className="aff-confirm-actions">
                <button
                  className="aff-confirm-cancel"
                  onClick={() => setConfirmDialog({ open: false, message: "", onConfirm: null })}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="aff-confirm-confirm"
                  onClick={() => {
                    const cb = confirmDialog.onConfirm;
                    setConfirmDialog({ open: false, message: "", onConfirm: null });
                    if (cb) cb();
                  }}
                >
                  {t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClientPlans;
