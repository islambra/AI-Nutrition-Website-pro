// components/CheckoutPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Shield, Check, 
  Calendar, MessageCircle, DollarSign
} from 'lucide-react';
import { buyPlan } from '../api/paymentApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import './CheckoutPage.css';

function CheckoutPage() {
  const { planId } = useParams();
  const location = useLocation();
  const plan = location.state?.plan;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await buyPlan(planId, paymentMethod);
      
      if (response.success) {
        toast.success('Plan purchased successfully!');
        // Update user in context if needed
        navigate('/my-plans');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    navigate('/plans');
    return null;
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
              {plan.planImage && (
                <img src={plan.planImage} alt={plan.planName} />
              )}
              <h3>{plan.planName}</h3>
              <span className="category">{plan.planCategory}</span>
              <p>{plan.description}</p>
              
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
                    <span className="value price">${plan.price}</span>
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
                      Pay ${plan.price}
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