import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, DollarSign, Loader2, Info,
  Upload, Check, CreditCard, Smartphone, FileText, BookOpen, Clock, ExternalLink
} from 'lucide-react';
import { initiatePayment, getDieteticienPaymentInfo } from '../api/paymentApi';
import { getFormationById } from '../api/formationApi';
import { useAuth } from '../context/AuthContext';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './CheckoutPage.css';

function FormationCheckoutPage() {
  const { t } = useTranslation();
  const { formationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAuth();
  const { setTimeoutSafe } = useSafeTimeout();

  const [formation, setFormation] = useState(location.state?.formation || null);
  const [loadingFormation, setLoadingFormation] = useState(!location.state?.formation);
  const [formationError, setFormationError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [dietPaymentInfo, setDietPaymentInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error(t('checkout.pleaseLogin'));
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname]);

  useEffect(() => {
    const fetchFormation = async () => {
      if (formation) return;
      try {
        setLoadingFormation(true);
        const response = await getFormationById(formationId);
        if (response.success) setFormation(response.data);
        else setFormationError(t('services.noPlans'));
      } catch {
        setFormationError(t('common.error'));
      } finally {
        setLoadingFormation(false);
      }
    };
    if (formationId) fetchFormation();
  }, [formationId, formation]);

  useEffect(() => {
    if (formation?.createdBy) {
      const fetchInfo = async () => {
        setLoadingInfo(true);
        try {
          const res = await getDieteticienPaymentInfo(formation.createdBy);
          if (res.success) setDietPaymentInfo(res.data);
        } catch {
          setDietPaymentInfo(null);
        } finally {
          setLoadingInfo(false);
        }
      };
      fetchInfo();
    }
  }, [formation?.createdBy]);

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
      formData.append('formationId', formationId);
      formData.append('paymentMethod', paymentMethod);
      formData.append('proofImage', proofFile);
      const res = await initiatePayment(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success(t('checkout.submitPayment'));
        setTimeoutSafe(() => navigate('/student/my-requests'), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingFormation) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (formationError || !formation) {
    return (
      <div className="AP-ErrorContainer" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Info size={48} style={{ color: '#EF4444', marginBottom: '20px' }} />
        <h2>{t('services.noPlans')}</h2>
        <p>{formationError || t('services.noPlans')}</p>
        <button onClick={() => navigate('/services')} className="AP-ClearFiltersBtn" style={{ marginTop: '20px' }}>
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
              {formation.image ? (
                <img src={formation.image} alt={formation.title} />
              ) : (
                <div className="plan-placeholder" style={{ height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '15px' }}>
                  <BookOpen size={48} color="#ccc" />
                </div>
              )}
              <h3>{formation.title}</h3>
              <p>{formation.description?.length > 150 ? `${formation.description.substring(0, 150)}...` : formation.description}</p>
              <div className="summary-details">
                <div className="summary-item">
                  <Clock size={18} />
                  <div>
                    <span className="label">{t('checkout.duration')}</span>
                    <span className="value"><Trans i18nKey="checkout.durationWeeks" values={{weeks: formation.durationWeeks}} /></span>
                  </div>
                </div>
                <div className="summary-item">
                  <Calendar size={18} />
                  <div>
                    <span className="label">{t('checkout.labelConsultations')}</span>
                    <span className="value"><Trans i18nKey="checkout.sessionsCount" values={{count: formation.sessionsCount}} /></span>
                  </div>
                </div>
                <div className="summary-item">
                  <DollarSign size={18} />
                  <div>
                    <span className="label">{t('checkout.price')}</span>
                    <span className="value price"><Trans i18nKey="checkout.priceValue" values={{price: formation.price.toLocaleString()}} /></span>
                  </div>
                </div>
              </div>
              <button className="summary-nav-link" onClick={() => navigate(`/services`)}>
                <ExternalLink size={14} /> {t('checkout.viewFormationDetails')}
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
                        <img src={proofPreview} alt="Proof preview" />
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
                      <p>{t('checkout.uploadReceipt')}</p>
                      <p>{t('checkout.uploadReceipt')}</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="pay-btn" disabled={submitting || !proofFile || !dietPaymentInfo} style={{ marginTop: '24px' }}>
                {submitting ? (
                  <><Loader2 size={18} className="AP-Spin" /> {t('common.loading')}</>
                ) : (
                  <><Upload size={18} /> {t('checkout.submitPayment')} - {formation.price.toLocaleString()} DZD</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default FormationCheckoutPage;
