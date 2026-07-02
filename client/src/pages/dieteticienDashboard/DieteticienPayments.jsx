import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Filter, Users, TrendingUp, DollarSign,
  Calendar, CreditCard, Package, GraduationCap, Layers,
  ChevronDown, RefreshCw, Sparkles
} from 'lucide-react';
import { getDieteticienPlanPayments } from '../../api/paymentApi';
import { useTranslation } from 'react-i18next';
import './DieteticienPayments.css';

const DieteticienPayments = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const refreshPayments = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.clientName.toLowerCase().includes(term) ||
        p.clientEmail.toLowerCase().includes(term) ||
        p.serviceName.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(p => p.serviceType.toLowerCase() === typeFilter);
    }

    if (methodFilter !== 'all') {
      result = result.filter(p => p.paymentMethod === methodFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.purchasedAt).getTime();
      const dateB = new Date(b.purchasedAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [payments, searchTerm, typeFilter, methodFilter, sortBy]);

  const stats = useMemo(() => {
    const total = payments.length;
    const revenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const plans = payments.filter(p => p.serviceType === 'Plan').length;
    const formations = payments.filter(p => p.serviceType === 'Formation').length;
    return { total, revenue, plans, formations };
  }, [payments]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sp-loading"
    >
      <div className="sp-loading-spinner">
        <div className="sp-spinner-ring"></div>
        <Sparkles className="sp-spinner-icon" size={28} />
      </div>
          <p>{t("common.loading")}</p>
    </motion.div>
  );

  if (error) return (
    <div className="sp-error">
      <div className="sp-error-icon">⚠️</div>
      <h3>Unable to load data</h3>
      <p>{error}</p>
      <button onClick={fetchPayments} className="sp-retry-btn">{t("common.tryAgain")}</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sp-container"
    >
      {/* Header */}
      <div className="sp-header">
        <div className="sp-header-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sp-page-badge">
              <TrendingUp size={14} />
                <span>{t("dashboard.dieteticien.payments.serviceBreakdown")}</span>
            </div>
            <h1>Plan & Formation Sales</h1>
            <p className="sp-subtitle">Track all your nutrition plan and formation purchases</p>
          </motion.div>
        </div>
        <motion.div
          className="sp-header-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sp-filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>
          <button onClick={refreshPayments} className="sp-refresh-btn" disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'sp-spin' : ''} />
            Refresh
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="sp-stats-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-total-icon">
            <Layers size={22} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{stats.total}</span>
            <span className="sp-stat-label">{t("dashboard.dieteticien.payments.totalSales")}</span>
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-plan-icon">
            <Package size={22} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{stats.plans}</span>
            <span className="sp-stat-label">Plans Sold</span>
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-formation-icon">
            <GraduationCap size={22} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{stats.formations}</span>
            <span className="sp-stat-label">Formations Sold</span>
          </div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-revenue-icon">
            <DollarSign size={22} />
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{stats.revenue.toLocaleString()} DZD</span>
            <span className="sp-stat-label">{t("dashboard.dieteticien.payments.revenue")}</span>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="sp-search-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="sp-search-wrapper">
          <Search size={18} className="sp-search-icon" />
          <input
            type="text"
            placeholder={t("dashboard.dieteticien.payments.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sp-search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="sp-clear-search">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="sp-search-info">
          <Users size={14} />
          <span>{filteredPayments.length} sale{filteredPayments.length !== 1 ? 's' : ''} found</span>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="sp-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sp-filter-inner">
              <div className="sp-filter-group">
                <label>Service Type</label>
                <div className="sp-filter-chips">
                  {['all', 'plan', 'formation'].map(type => (
                    <button
                      key={type}
                      className={`sp-chip ${typeFilter === type ? 'active' : ''}`}
                      onClick={() => setTypeFilter(type)}
                    >
                      {type === 'all' ? t("common.all") : t("dashboard.dieteticien.payments." + type)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sp-filter-group">
                <label>Payment Method</label>
                <div className="sp-filter-chips">
                  {[
                    { value: 'all', label: t("common.all") },
                    { value: 'ccp', label: 'CCP' },
                    { value: 'baridimob', label: 'BaridiMob' }
                  ].map(m => (
                    <button
                      key={m.value}
                      className={`sp-chip ${methodFilter === m.value ? 'active' : ''}`}
                      onClick={() => setMethodFilter(m.value)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sp-filter-group">
                <label>Sort By</label>
                <div className="sp-filter-chips">
                  {[
                    { value: 'newest', label: t("dashboard.dieteticien.payments.newest") },
                    { value: 'oldest', label: t("dashboard.dieteticien.payments.oldest") }
                  ].map(s => (
                    <button
                      key={s.value}
                      className={`sp-chip ${sortBy === s.value ? 'active' : ''}`}
                      onClick={() => setSortBy(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales List */}
      {filteredPayments.length === 0 ? (
        <motion.div
          className="sp-empty"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="sp-empty-icon"><Layers size={48} /></div>
          <h3>{t("dashboard.dieteticien.payments.noPayments")}</h3>
          <p>
            {searchTerm || typeFilter !== 'all' || methodFilter !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Your sales will appear here once clients start purchasing.'}
          </p>
          {(searchTerm || typeFilter !== 'all' || methodFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('all'); setMethodFilter('all'); }}
              className="sp-clear-filters-btn"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="sp-grid">
          <AnimatePresence>
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.03 }}
                className="sp-card"
              >
                <div className="sp-card-gradient"></div>
                <div className="sp-card-content">
                  <div className="sp-client-section">
                    <div className="sp-client-avatar">
                      {payment.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="sp-client-details">
                      <h3>{payment.clientName}</h3>
                      <span className="sp-client-email">{payment.clientEmail}</span>
                    </div>
                    <span className={`sp-type-badge ${payment.serviceType.toLowerCase()}`}>
                      {payment.serviceType === 'Plan' ? <Package size={12} /> : <GraduationCap size={12} />}
                      {payment.serviceType}
                    </span>
                  </div>

                  <div className="sp-service-row">
                    <div className="sp-service-chip">
                      {payment.serviceType === 'Plan' ? <Package size={14} /> : <GraduationCap size={14} />}
                      <span>{payment.serviceName}</span>
                    </div>
                    <div className="sp-service-chip sp-method-chip">
                      <CreditCard size={14} />
                      <span>{payment.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="sp-price-row">
                    <span className="sp-amount">{payment.amount.toLocaleString()} DZD</span>
                    <div className="sp-date-badge">
                      <Calendar size={12} />
                      <span>{formatDate(payment.purchasedAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default DieteticienPayments;