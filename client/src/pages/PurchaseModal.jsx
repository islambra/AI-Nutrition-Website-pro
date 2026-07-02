// components/PurchaseModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Sparkles, Calendar, MessageCircle, 
  DollarSign, Clock, Target, Loader2, ShoppingCart,
  ArrowRight, Shield
} from 'lucide-react';
import { checkPlanOwnership } from '../api/paymentApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PurchaseModal.css';

function PurchaseModal({ isOpen, onClose, plan, onBuyNow, onViewMyPlan }) {
  const { t } = useTranslation();
  const [planStatus, setPlanStatus] = useState(null); // null = loading, 'owned', 'not-owned'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      checkOwnership();
    } else {
      setPlanStatus(null);
    }
  }, [isOpen, plan]);

  const checkOwnership = async () => {
    setLoading(true);
    setPlanStatus(null);
    
    try {
      const response = await checkPlanOwnership(plan._id);
      setPlanStatus(response.ownsPlan ? 'owned' : 'not-owned');
    } catch (error) {
      toast.error(t('common.error'));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="PM-Overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="PM-Modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="PM-CloseBtn" onClick={onClose}>
            <X size={20} />
          </button>

          {/* Loading State */}
          {loading && (
            <div className="PM-Loading">
              <Loader2 size={48} className="PM-Spin" />
              <p>{t('common.loading')}</p>
            </div>
          )}

          {/* Plan Already Owned */}
          {planStatus === 'owned' && (
            <div className="PM-Content">
              <div className="PM-IconWrapper owned">
                <Check size={48} />
              </div>
              <h2>{t('plans.owned')}</h2>
              <div className="PM-PlanInfo">
                <h3>{plan.planName}</h3>
                <span className="PM-Category">{plan.planCategory}</span>
              </div>
              <p className="PM-Message">
                {t('plans.viewMyPlan')}
              </p>
              <div className="PM-Details">
                <div className="PM-Detail">
                  <Calendar size={16} />
                  <span>{plan.duration} {t('purchase.daysProgram')}</span>
                </div>
                <div className="PM-Detail">
                  <MessageCircle size={16} />
                  <span>{plan.consultationIncluded} {t('purchase.consultations')}</span>
                </div>
              </div>
              <div className="PM-Actions">
                <button className="PM-BtnSecondary" onClick={onClose}>
                  {t('common.cancel')}
                </button>
                <button className="PM-BtnPrimary" onClick={onViewMyPlan}>
                  {t('plans.viewMyPlan')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Plan Not Owned - Buy */}
          {planStatus === 'not-owned' && (
            <div className="PM-Content">
              <div className="PM-IconWrapper not-owned">
                <Sparkles size={48} />
              </div>
              <h2>{t('purchase.readyToStart')}</h2>
              <div className="PM-PlanInfo">
                <h3>{plan.planName}</h3>
                <span className="PM-Category">{plan.planCategory}</span>
              </div>
              <p className="PM-Description">{plan.description?.substring(0, 120)}...</p>
              
              <div className="PM-Features">
                <div className="PM-Feature">
                  <Calendar size={18} />
                  <div>
                    <span className="PM-FeatureLabel">{t('purchase.duration')}</span>
                    <span className="PM-FeatureValue">{plan.duration} {t('purchase.days')}</span>
                  </div>
                </div>
                <div className="PM-Feature">
                  <MessageCircle size={18} />
                  <div>
                    <span className="PM-FeatureLabel">{t('purchase.consultations')}</span>
                    <span className="PM-FeatureValue">{plan.consultationIncluded} {t('purchase.sessions')}</span>
                  </div>
                </div>
                <div className="PM-Feature">
                  <Target size={18} />
                  <div>
                    <span className="PM-FeatureLabel">{t('purchase.target')}</span>
                    <span className="PM-FeatureValue">{plan.targetUserProfile}</span>
                  </div>
                </div>
                <div className="PM-Feature">
                  <Clock size={18} />
                  <div>
                    <span className="PM-FeatureLabel">{t('purchase.followUp')}</span>
                    <span className="PM-FeatureValue">{plan.followUpFrequency}</span>
                  </div>
                </div>
              </div>

              <div className="PM-PriceSection">
                <div className="PM-PriceTag">
                  <DollarSign size={24} />
                  <span className="PM-PriceAmount">{plan.price}</span>
                </div>
                <div className="PM-SecureBadge">
                  <Shield size={14} />
                  <span>{t('purchase.securePayment')}</span>
                </div>
              </div>

              <div className="PM-Actions">
                <button className="PM-BtnSecondary" onClick={onClose}>
                  {t('common.cancel')}
                </button>
                <button className="PM-BtnPrimary PM-BuyBtn" onClick={onBuyNow}>
                  <ShoppingCart size={18} />
                  {t('plans.buyNow')} - DZD{plan.price}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PurchaseModal;