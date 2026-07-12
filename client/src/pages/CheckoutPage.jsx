import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Shield, Check, 
  Calendar, MessageCircle, DollarSign, Loader2, Info
} from 'lucide-react';
import { buyPlan } from '../api/paymentApi';
import { getPlanById } from '../api/planApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './CheckoutPage.css';

function CheckoutPage() {
  const { t } = useTranslation();
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(location.state?.plan || null);
  const [loadingPlan, setLoadingPlan] = useState(!location.state?.plan);
  const [planError, setPlanError] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: user?.fullName || ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error(t('checkout.pleaseLogin'));
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (plan) return;
      
      try {
        setLoadingPlan(true);
        const response = await getPlanById(planId);
        if (response.success) {
          setPlan(response.data);
        } else {
          setPlanError(t('plans.noPlans'));
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setPlanError(t('common.error'));
      } finally {
        setLoadingPlan(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, plan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t('checkout.pleaseLogin'));
      return;
    }

    setLoading(true);

    try {
      const response = await buyPlan(planId, paymentMethod);
      
      if (response.success) {
        toast.success(t('common.success'));
        navigate('/my-plans');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loadingPlan) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <div className="AP-ErrorContainer" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Info size={48} style={{ color: '#EF4444', marginBottom: '20px' }} />
        <h2>{t('plans.noPlans')}</h2>
        <p>{planError || t('plans.noPlans')}</p>
        <button 
          onClick={() => navigate('/allPlans')}
          className="AP-ClearFiltersBtn"
          style={{ marginTop: '20px' }}
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          {t('common.back')}
        </button>

        <div className="checkout-container">
          {/* Order Summary */}
          <motion.div 
            className="order-summary"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h2>{t('checkout.completePurchase')}</h2>
            
            <div className="plan-summary-card">
              {plan.planImage ? (
                <img src={plan.planImage} alt={plan.planName} loading="lazy" />
              ) : (
                <div className="plan-placeholder" style={{ height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '15px' }}>
                  <Calendar size={48} color="#ccc" />
                </div>
              )}
              <h3>{plan.planName}</h3>
              <span className="category">{plan.planCategory}</span>
              <p>{plan.description?.length > 150 ? `${plan.description.substring(0, 150)}...` : plan.description}</p>
              
              <div className="summary-details">
                <div className="summary-item">
                  <Calendar size={18} />
                  <div>
                    <span className="label">{t('checkout.duration')}</span>
                    <span className="value"><Trans i18nKey="checkout.durationWeeks" values={{weeks: plan.duration}} /></span>
                  </div>
                </div>
                <div className="summary-item">
                  <MessageCircle size={18} />
                  <div>
                    <span className="label">{t('checkout.labelConsultations')}</span>
                    <span className="value"><Trans i18nKey="checkout.sessionsCount" values={{count: plan.consultationIncluded}} /></span>
                  </div>
                </div>
                <div className="summary-item">
                  <DollarSign size={18} />
                  <div>
                    <span className="label">{t('checkout.price')}</span>
                    {/* ✅ Fixed: removed * 140 */}
                    <span className="value price"><Trans i18nKey="checkout.priceValue" values={{price: plan.price.toLocaleString()}} /></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div 
            className="payment-form-container"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h2>{t('checkout.submitPayment')}</h2>

            <div className="payment-methods">
              <button
                className={`method-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit_card')}
              >
                <CreditCard size={20} />
                {t('checkout.creditCard')}
              </button>
              <button
                className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                {t('checkout.ccp')}
              </button>
            </div>

            {paymentMethod === 'credit_card' && (
              <form onSubmit={handleSubmit} className="card-form">
                <div className="form-group">
                  <label>{t('checkout.cardHolderName')}</label>
                  <input
                    type="text"
                    placeholder={t('checkout.cardHolderPlaceholder')}
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('checkout.cardNumber')}</label>
                  <input
                    type="text"
                    placeholder={t('checkout.cardNumberPlaceholder')}
                    value={cardInfo.cardNumber}
                    onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('checkout.expiryDate')}</label>
                    <input
                      type="text"
                      placeholder={t('checkout.expiryPlaceholder')}
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('checkout.cvv')}</label>
                    <input
                      type="text"
                      placeholder={t('checkout.cvvPlaceholder')}
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                <div className="secure-badge">
                  <Shield size={16} />
                  <span>{t('checkout.securePayment')}</span>
                </div>

                <button type="submit" className="pay-btn" disabled={loading}>
                  {loading ? (
                    t('common.loading')
                  ) : (
                    <>
                      <Check size={20} />
                      <Trans i18nKey="checkout.payNowAmount" values={{amount: plan.price.toLocaleString()}} />
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentMethod === 'paypal' && (
              <div className="paypal-section">
                <p>{t('checkout.uploadProof')}</p>
                <button onClick={handleSubmit} className="pay-btn paypal-btn" disabled={loading}>
                  {loading ? t('common.loading') : t('checkout.payNow')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default CheckoutPage;