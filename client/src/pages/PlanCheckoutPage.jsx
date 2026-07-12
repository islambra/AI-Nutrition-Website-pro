import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MessageCircle, DollarSign, Loader2, Info,
  Upload, Check, CreditCard, Smartphone, FileText, Shield, ExternalLink
} from 'lucide-react';
import { initiatePayment, getDieteticienPaymentInfo, checkPlanOwnership } from '../api/paymentApi';
import { getPlanById } from '../api/planApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import './CheckoutPage.css';

function PlanCheckoutPage() {
  const { t } = useTranslation();
  const { setTimeoutSafe } = useSafeTimeout();
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(location.state?.plan || null);
  const [loadingPlan, setLoadingPlan] = useState(!location.state?.plan);
  const [planError, setPlanError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [dietPaymentInfo, setDietPaymentInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

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
        if (response.success) setPlan(response.data);
        else setPlanError(t('plans.noPlans'));
      } catch {
        setPlanError(t('common.error'));
      } finally {
        setLoadingPlan(false);
      }
    };
    if (planId) fetchPlan();
  }, [planId, plan]);

  useEffect(() => {
    if (plan && !authLoading) {
      checkPlanOwnership(plan._id)
        .then(res => {
          if (res.ownsPlan) {
            setAlreadyOwned(true);
            toast.error(t('checkout.alreadyOwned') || 'You already own this plan');
          }
        })
        .catch(() => {})
        .finally(() => setCheckingOwnership(false));
    } else if (!plan && !authLoading) {
      setCheckingOwnership(false);
    }
  }, [plan, authLoading]);

  useEffect(() => {
    if (plan?.createdBy) {
      const fetchInfo = async () => {
        setLoadingInfo(true);
        try {
          const res = await getDieteticienPaymentInfo(plan.createdBy);
          if (res.success) setDietPaymentInfo(res.data);
        } catch {
          setDietPaymentInfo(null);
        } finally {
          setLoadingInfo(false);
        }
      };
      fetchInfo();
    }
  }, [plan?.createdBy]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      toast.error(t('checkout.uploadProof'));
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('planId', planId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('proofImage', proofFile);
      const res = await initiatePayment(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success(t('checkout.submitPayment'));
        setTimeoutSafe(() => navigate('/client/my-requests'), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
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

  if (checkingOwnership) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (alreadyOwned) {
    return (
      <PageTransition>
        <div className="checkout-page">
          <div className="checkout-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} style={{ color: '#2E7D32' }} />
            </motion.div>
            <h2>{t('checkout.alreadyOwned') || 'Plan already owned'}</h2>
            <p style={{ color: '#6B7280', marginTop: 12, lineHeight: 1.6 }}>
              {t('checkout.alreadyOwnedMessage') || 'You already have access to this plan.'}
            </p>
            <button onClick={() => navigate('/allPlans')} className="pay-btn" style={{ marginTop: '24px' }}>
              {t('common.back') || 'Back to plans'}
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (planError || !plan) {
    return (
      <div className="AP-ErrorContainer" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Info size={48} style={{ color: '#EF4444', marginBottom: '20px' }} />
        <h2>{t('plans.noPlans')}</h2>
        <p>{planError || t('plans.noPlans')}</p>
        <button onClick={() => navigate('/allPlans')} className="AP-ClearFiltersBtn" style={{ marginTop: '20px' }}>
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <PageTransition>
        <div className="checkout-page">
          <div className="checkout-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} style={{ color: '#2E7D32' }} />
            </motion.div>
            <h2>{t('checkout.submitPayment')}</h2>
            <p style={{ color: '#6B7280', marginTop: 12, lineHeight: 1.6 }}>
              {t('checkout.uploadProof')}
            </p>
            <div style={{ marginTop: 24, color: '#9CA3AF', fontSize: 14 }}>{t('common.loading')}</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> {t('common.back')}
        </button>

        <div className="checkout-container">
          <motion.div className="order-summary" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
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
                    <span className="value price"><Trans i18nKey="checkout.priceValue" values={{price: plan.price.toLocaleString()}} /></span>
                  </div>
                </div>
              </div>
              <button className="summary-nav-link" onClick={() => navigate(`/allPlans`)}>
                <ExternalLink size={14} /> {t('checkout.viewPlanDetails')}
              </button>
            </div>
          </motion.div>

          <motion.div className="payment-form-container" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2>{t('checkout.submitPayment')}</h2>

            <div className="payment-methods">
              <button className={`method-btn ${paymentMethod === 'ccp' ? 'active' : ''}`} onClick={() => setPaymentMethod('ccp')}>
                <CreditCard size={20} /> {t('checkout.ccp')}
              </button>
              <button className={`method-btn ${paymentMethod === 'baridimob' ? 'active' : ''}`} onClick={() => setPaymentMethod('baridimob')}>
                <Smartphone size={20} /> {t('checkout.baridiMob')}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Dieteticien Payment Info */}
              <div className="form-section-payment">
                <h4>{t('checkout.paymentInfo')}</h4>
                {loadingInfo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280' }}>
                    <Loader2 size={16} className="AP-Spin" /> {t('common.loading')}
                  </div>
                ) : dietPaymentInfo ? (
                  <div className="payment-info-card" style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0' }}>
                    {paymentMethod === 'ccp' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DCFCE7' }}>
                          <span style={{ color: '#374151' }}>{t('checkout.ccpNumber')}</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.ccpNumber || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span style={{ color: '#374151' }}>{t('checkout.ccpKey')}</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.ccpKey || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: '#374151' }}>{t('checkout.baridiMobNumber')}</span>
                        <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.baridiMob || '—'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#EF4444', fontSize: 14 }}>{t('checkout.paymentInfoUnavailable')}</div>
                )}
              </div>

              {/* Proof Upload */}
              <div className="form-section-payment">
                <h4>{t('checkout.proofUpload')}</h4>
                <p>{t('checkout.uploadReceipt')}</p>
                <div
                  className="upload-zone"
                  onClick={() => document.getElementById('proof-input')?.click()}
                >
                  <input id="proof-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  {proofPreview ? (
                    <div style={{ width: '100%' }}>
                      <div className="upload-preview">
                        <img src={proofPreview} alt="Proof preview" loading="lazy" />
                        <div className="upload-preview-overlay">
                          <Upload size={28} />
                          <span>{t('checkout.changeFile')}</span>
                        </div>
                      </div>
                      <div className="upload-file-name">
                        <FileText size={14} /> {proofFile?.name}
                      </div>
                    </div>
                  ) : (
                    <div className="upload-zone-content">
                      <div className="upload-zone-icon-wrapper">
                        <Upload size={24} />
                      </div>
                      <p>{t('checkout.clickToUpload')}</p>
                      <p>{t('checkout.screenshotOrReceipt')}</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="pay-btn" disabled={submitting || !proofFile || !dietPaymentInfo} style={{ marginTop: '24px' }}>
                {submitting ? (
                  <><Loader2 size={18} className="AP-Spin" /> {t('common.loading')}</>
                ) : (
                  <><Upload size={18} /> {t('checkout.submitPayment')} - {plan.price.toLocaleString()} DZD</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default PlanCheckoutPage;
