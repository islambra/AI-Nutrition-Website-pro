import React, { useState, useEffect } from 'react';
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
        if (response.success) {
          setPlan(response.data);
        } else {
          setPlanError('Plan not found');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setPlanError('Error loading plan details');
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
      toast.error('Please login to purchase');
      return;
    }

    setLoading(true);

    try {
      const response = await buyPlan(planId, paymentMethod);
      
      if (response.success) {
        toast.success('Plan purchased successfully!');
        navigate('/my-plans');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
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
        <button 
          onClick={() => navigate('/allPlans')}
          className="AP-ClearFiltersBtn"
          style={{ marginTop: '20px' }}
        >
          Back to Plans
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="checkout-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="checkout-container">
          {/* Order Summary */}
          <motion.div 
            className="order-summary"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
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
                    <span className="value price">{(plan.price * 140).toLocaleString()} DZD</span>
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
            <h2>Payment Details</h2>

            <div className="payment-methods">
              <button
                className={`method-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('credit_card')}
              >
                <CreditCard size={20} />
                Credit Card
              </button>
              <button
                className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                PayPal
              </button>
            </div>

            {paymentMethod === 'credit_card' && (
              <form onSubmit={handleSubmit} className="card-form">
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardInfo.name}
                    onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardInfo.cardNumber}
                    onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                    maxLength="19"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                <div className="secure-badge">
                  <Shield size={16} />
                  <span>Your payment information is secure</span>
                </div>

                <button type="submit" className="pay-btn" disabled={loading}>
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Check size={20} />
                      Pay {(plan.price * 140).toLocaleString()} DZD
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentMethod === 'paypal' && (
              <div className="paypal-section">
                <p>You will be redirected to PayPal to complete your payment.</p>
                <button onClick={handleSubmit} className="pay-btn paypal-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Continue with PayPal'}
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