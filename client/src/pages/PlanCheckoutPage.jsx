import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MessageCircle, DollarSign, Loader2, Info,
  Upload, Check, CreditCard, Smartphone, FileText, Shield
} from 'lucide-react';
import { initiatePayment, getDieteticienPaymentInfo } from '../api/paymentApi';
import { getPlanById } from '../api/planApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './CheckoutPage.css';

function PlanCheckoutPage() {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAuth();

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to continue');
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
        else setPlanError('Plan not found');
      } catch {
        setPlanError('Error loading plan details');
      } finally {
        setLoadingPlan(false);
      }
    };
    if (planId) fetchPlan();
  }, [planId, plan]);

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
      toast.error('Please upload your payment proof image');
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
        toast.success('Payment proof submitted! Waiting for confirmation.');
        setTimeout(() => navigate('/my-plans'), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingPlan) {
    return (
      <div className="AP-LoadingContainer">
        <Loader2 size={48} className="AP-Spin" />
        <p>Loading checkout details...</p>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <div className="AP-ErrorContainer" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Info size={48} style={{ color: '#EF4444', marginBottom: '20px' }} />
        <h2>Oops! Plan Not Found</h2>
        <p>{planError || "The plan you're looking for doesn't exist or has been removed."}</p>
        <button onClick={() => navigate('/allPlans')} className="AP-ClearFiltersBtn" style={{ marginTop: '20px' }}>
          Back to Plans
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
            <h2>Payment Proof Submitted!</h2>
            <p style={{ color: '#6B7280', marginTop: 12, lineHeight: 1.6 }}>
              Your payment proof has been sent to the dieteticien for verification.<br />
              You will get access to the plan once they confirm your payment.
            </p>
            <div style={{ marginTop: 24, color: '#9CA3AF', fontSize: 14 }}>Redirecting to My Plans...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>

        <div className="checkout-container">
          <motion.div className="order-summary" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2>Order Summary</h2>
            <div className="plan-summary-card">
              {plan.planImage ? (
                <img src={plan.planImage} alt={plan.planName} />
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
                    <span className="label">Duration</span>
                    <span className="value">{plan.duration} Weeks</span>
                  </div>
                </div>
                <div className="summary-item">
                  <MessageCircle size={18} />
                  <div>
                    <span className="label">Consultations</span>
                    <span className="value">{plan.consultationIncluded} Sessions</span>
                  </div>
                </div>
                <div className="summary-item">
                  <DollarSign size={18} />
                  <div>
                    <span className="label">Price</span>
                    <span className="value price">{plan.price.toLocaleString()} DZD</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="payment-form-container" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2>Payment Details</h2>

            <div className="payment-methods">
              <button className={`method-btn ${paymentMethod === 'ccp' ? 'active' : ''}`} onClick={() => setPaymentMethod('ccp')}>
                <CreditCard size={20} /> CCP
              </button>
              <button className={`method-btn ${paymentMethod === 'baridimob' ? 'active' : ''}`} onClick={() => setPaymentMethod('baridimob')}>
                <Smartphone size={20} /> BaridiMob
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Dieteticien Payment Info */}
              <div className="form-section-payment">
                <h4>Transfer to this account</h4>
                {loadingInfo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280' }}>
                    <Loader2 size={16} className="AP-Spin" /> Loading payment info...
                  </div>
                ) : dietPaymentInfo ? (
                  <div className="payment-info-card" style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0' }}>
                    {paymentMethod === 'ccp' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #DCFCE7' }}>
                          <span style={{ color: '#374151' }}>CCP Number</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.ccpNumber || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span style={{ color: '#374151' }}>CCP Key</span>
                          <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.ccpKey || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: '#374151' }}>BaridiMob Number</span>
                        <span style={{ fontWeight: 700, color: '#166534' }}>{dietPaymentInfo.baridiMob || '—'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#EF4444', fontSize: 14 }}>This dieteticien hasn't set up payment info yet.</div>
                )}
              </div>

              {/* Proof Upload */}
              <div className="form-section-payment" style={{ marginTop: '24px' }}>
                <h4>Upload Payment Proof</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  After making the transfer, upload a screenshot or receipt as proof.
                </p>
                <div
                  className="upload-zone"
                  onClick={() => document.getElementById('proof-input')?.click()}
                  style={{
                    border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '24px',
                    textAlign: 'center', cursor: 'pointer', background: '#FAFAFA'
                  }}
                >
                  <input id="proof-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  {proofPreview ? (
                    <div>
                      <img src={proofPreview} alt="Proof preview" style={{ maxHeight: '150px', borderRadius: '8px', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', color: '#6B7280' }}><FileText size={14} /> {proofFile?.name}</div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                      <p style={{ fontWeight: 600, color: '#374151' }}>Click to upload proof</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Screenshot or receipt image</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="pay-btn" disabled={submitting || !proofFile || !dietPaymentInfo} style={{ marginTop: '24px' }}>
                {submitting ? (
                  <><Loader2 size={18} className="AP-Spin" /> Submitting...</>
                ) : (
                  <><Upload size={18} /> Submit Payment Proof - {plan.price.toLocaleString()} DZD</>
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
