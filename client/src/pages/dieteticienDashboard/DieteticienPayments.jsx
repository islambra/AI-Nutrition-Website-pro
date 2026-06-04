import React, { useState, useEffect } from 'react';
import { getDieteticienPlanPayments } from '../../api/paymentApi';
import { User, Package, Calendar, CreditCard, TrendingUp, DollarSign, Users } from 'lucide-react';
import './DieteticienPayments.css';

const DieteticienPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getDieteticienPlanPayments();
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Calculate total earnings
  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return (
    <div className="dieteticien-loading">
      <div className="loading-spinner"></div>
      <p>Loading sales data...</p>
    </div>
  );
  
  if (error) return (
    <div className="dieteticien-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load data</h3>
      <p>{error}</p>
      <button onClick={fetchPayments} className="retry-btn">Try Again</button>
    </div>
  );

  return (
    <div className="dieteticien-payments-container">
      {/* Header with stats */}
      <div className="page-header">
        <div className="header-left">
          <h1>Plan Sales</h1>
          <p className="subtitle">Track your nutrition plan purchases</p>
        </div>
        <div className="stats-card">
          <div className="stat-item">
            <TrendingUp size={20} />
            <div>
              <span className="stat-label">Total Sales</span>
              <span className="stat-value">{payments.length}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <DollarSign size={20} />
            <div>
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">{totalEarnings.toLocaleString()} DZD</span>
            </div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={48} /></div>
          <h3>No purchases yet</h3>
          <p>Your plans will appear here once clients start buying.</p>
        </div>
      ) : (
        <div className="payments-grid">
          {payments.map(payment => (
            <div key={payment._id} className="payment-card">
              <div className="card-gradient"></div>
              <div className="card-content">
                <div className="client-section">
                  <div className="client-avatar">
                    <User size={22} />
                  </div>
                  <div className="client-details">
                    <h3>{payment.clientName}</h3>
                    <span className="client-email">{payment.clientEmail}</span>
                  </div>
                </div>
                
                <div className="plan-details">
                  <div className="detail-chip">
                    <Package size={14} />
                    <span>{payment.planName}</span>
                  </div>
                  <div className="detail-chip highlight">
                    <CreditCard size={14} />
                    <span>{payment.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>

                <div className="price-row">
                  <span className="amount">{payment.amount.toLocaleString()} DZD</span>
                  <div className="date-badge">
                    <Calendar size={12} />
                    <span>{formatDate(payment.purchasedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DieteticienPayments;