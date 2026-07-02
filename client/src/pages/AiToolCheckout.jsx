import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Info,
  Upload, Check, CreditCard, Smartphone, Zap, Clock
} from 'lucide-react';
import { getPlatformPaymentInfo, initiateAiToolSubscription } from '../api/aiToolApi';
import { useAuth } from '../context/AuthContext';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './CheckoutPage.css';

function AiToolCheckout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAuth();
  const { setTimeoutSafe } = useSafeTimeout();

  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const PRICE = 499.99;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error(t('checkout.loginRequired'));
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname]);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoadingInfo(true);
      try {
        const res = await getPlatformPaymentInfo();
        if (res.success) setPlatformInfo(res.data);
      } catch {
        setPlatformInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, []);

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
      toast.error(t('checkout.uploadProofRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      formData.append('proofImage', proofFile);
      const res = await initiateAiToolSubscription(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success(t('checkout.paymentSubmittedDesc'));
        const role = user?.role;
        const requestsPath = role === 'student' ? '/student/my-requests' : '/client/my-requests';
        setTimeoutSafe(() => navigate(requestsPath, { state: { defaultType: 'ai-tool' } }), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.submissionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>{t('checkout.loadingDetails')}</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (submitted) {
    return (
      <PageTransition>
        <div className="checkout-page">
          <div className="checkout-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} style={{ color: '#2E7D32' }} />
            </motion.div>
            <h2>{t('checkout.paymentSubmittedTitle')}</h2>
            <p style={{ color: '#6B7280', marginTop: 12, lineHeight: 1.6 }}>
              {t('checkout.paymentSubmittedDesc')}
            </p>
            <div style={{ marginTop: 24, color: '#9CA3AF', fontSize: 14 }}>{t('checkout.redirecting')}</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> {t('checkout.back')}
        </button>

        <div className="checkout-container">
          <motion.div className="order-summary" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2>{t('checkout.orderSummary')}</h2>
            <div className="plan-summary-card">
              <div style={{ height: '150px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '15px' }}>
                <Zap size={48} color="#fff" />
              </div>
              <h3>{t('checkout.aiScannerSubscription')}</h3>
              <span className="category" style={{ background: '#EDE9FE', color: '#6D28D9' }}>{t('checkout.yearlyAccess')}</span>
              <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>
                {t('checkout.aiScannerDesc')}
              </p>
              <div className="summary-details">
                <div className="summary-item">
                  <Zap size={18} />
                  <div>
                    <span className="label">{t('checkout.access')}</span>
                    <span className="value">{t('checkout.aiFoodScanner')}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <Clock size={18} />
                  <div>
                    <span className="label">{t('checkout.duration')}</span>
                    <span className="value">{t('checkout.oneYear')}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <Info size={18} />
                  <div>
                    <span className="label">{t('checkout.price')}</span>
                    <span className="value price">{PRICE.toLocaleString()} DZD</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="payment-form-container" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2>{t('checkout.paymentDetails')}</h2>

            <div className="payment-methods">
              <button className={`method-btn ${paymentMethod === 'ccp' ? 'active' : ''}`} onClick={() => setPaymentMethod('ccp')}>
                <CreditCard size={20} /> CCP
              </button>
              <button className={`method-btn ${paymentMethod === 'baridimob' ? 'active' : ''}`} onClick={() => setPaymentMethod('baridimob')}>
                <Smartphone size={20} /> BaridiMob
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section-payment">
                <h4>{t('checkout.transferTo')}</h4>
                {loadingInfo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280' }}>
                    <Loader2 size={16} className="AP-Spin" /> {t('checkout.loadingPaymentInfo')}
                  </div>
                ) : platformInfo ? (
                  <div className="payment-info-card" style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0' }}>
                    {paymentMethod === 'ccp' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DCFCE7' }}>
                          <span style={{ color: '#374151' }}>{t('checkout.ccpNumber')}</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.ccpNumber || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span style={{ color: '#374151' }}>{t('checkout.ccpKey')}</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.ccpKey || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: '#374151' }}>{t('checkout.baridiMobNumber')}</span>
                        <span style={{ fontWeight: 700, color: '#166534' }}>{platformInfo.baridiMob || '—'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#EF4444', fontSize: 14 }}>{t('checkout.paymentInfoNotAvailable')}</div>
                )}
              </div>

              <div className="form-section-payment" style={{ marginTop: '24px' }}>
                <h4>{t('checkout.uploadProof')}</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  {t('checkout.uploadProofDesc')}
                </p>
                <div
                  className="upload-zone"
                  onClick={() => document.getElementById('proof-input')?.click()}
                  style={{
                    border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '24px',
                    textAlign: 'center', cursor: 'pointer', background: '#FAFAFA',
                    minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <input id="proof-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  {proofPreview ? (
                    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <img src={proofPreview} alt="Proof preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fff', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                      >
                        <Upload size={28} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{t('checkout.changeFile')}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={24} style={{ color: '#059669' }} />
                      </div>
                      <p style={{ fontWeight: 600, color: '#374151', margin: 0 }}>{t('checkout.clickToUpload')}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{t('checkout.screenshotOrReceipt')}</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="pay-btn" disabled={submitting || !proofFile || !platformInfo} style={{ marginTop: '24px' }}>
                {submitting ? (
                  <><Loader2 size={18} className="AP-Spin" /> {t('checkout.submitting')}</>
                ) : (
                  <><Upload size={18} /> {t('checkout.submitPaymentProof', { price: PRICE.toLocaleString() })}</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AiToolCheckout;
