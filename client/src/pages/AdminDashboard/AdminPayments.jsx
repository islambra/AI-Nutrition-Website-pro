import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPaymentsAdmin, deletePaymentAdmin } from '../../api/paymentApi';
import {
  Trash2, Search, Filter, Package, CreditCard, DollarSign,
  X, AlertTriangle, CheckCircle, XCircle,
  BookOpen, Calendar, ChevronDown, Wallet, ArrowUpRight,
  GraduationCap
} from 'lucide-react';
import { useSafeTimeout } from '../../hooks/useSafeTimeout';
import './AdminPayments.css';

const TYPE_CONFIG = {
  Plan: {
    icon: Package,
    color: '#0369a1',
    bg: '#e0f2fe',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
  },
  'AI Tracker': {
    icon: CreditCard,
    color: '#15803d',
    bg: '#dcfce7',
    gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
  },
  'Course Subscription': {
    icon: BookOpen,
    color: '#92400e',
    bg: '#fef3c7',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  },
  Formation: {
    icon: GraduationCap,
    color: '#7c3aed',
    bg: '#ede9fe',
    gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
  },
};

const PAYMENT_METHOD_ICONS = {
  ccp: Wallet,
  baridimob: CreditCard,
};

const PAYMENT_METHOD_LABELS = {
  ccp: 'CCP',
  baridimob: 'BaridiMob',
};

const AdminPayments = () => {
  const { t } = useTranslation();
  const { setTimeoutSafe } = useSafeTimeout();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentAmount, setSelectedPaymentAmount] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, typeFilter, searchQuery, startDate, endDate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPaymentsAdmin();
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.failedToLoadPayments'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.user?.fullName?.toLowerCase().includes(query) ||
        p.user?.email?.toLowerCase().includes(query)
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => new Date(p.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.createdAt) <= end);
    }
    setFilteredPayments(filtered);
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  const openDeleteModal = (id, amount) => {
    setSelectedPaymentId(id);
    setSelectedPaymentAmount(amount);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPaymentId) return;
    try {
      setDeletingId(selectedPaymentId);
      await deletePaymentAdmin(selectedPaymentId);
      setPayments(prev => prev.filter(p => p._id !== selectedPaymentId));
      setModalOpen(false);
      showToast(t('admin.paymentDeletedSuccess', { amount: selectedPaymentAmount?.toLocaleString() }), 'success');
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.deleteFailed'), 'error');
    } finally {
      setDeletingId(null);
      setSelectedPaymentId(null);
      setSelectedPaymentAmount(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeoutSafe(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const planCount = filteredPayments.filter(p => p.type === 'Plan').length;
  const formationCount = filteredPayments.filter(p => p.type === 'Formation').length;
  const aiCount = filteredPayments.filter(p => p.type === 'AI Tracker').length;
  const courseSubCount = filteredPayments.filter(p => p.type === 'Course Subscription').length;
  const planRevenue = filteredPayments.filter(p => p.type === 'Plan').reduce((sum, p) => sum + p.amount, 0);
  const formationRevenue = filteredPayments.filter(p => p.type === 'Formation').reduce((sum, p) => sum + p.amount, 0);
  const aiRevenue = filteredPayments.filter(p => p.type === 'AI Tracker').reduce((sum, p) => sum + p.amount, 0);
  const courseSubRevenue = filteredPayments.filter(p => p.type === 'Course Subscription').reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    {
      label: t('admin.totalRevenue'),
      value: `${totalRevenue.toLocaleString()} DZD`,
      icon: DollarSign,
      cssClass: 'total-stat',
    },
    {
      label: t('admin.planSales'),
      value: `${planCount} · ${planRevenue.toLocaleString()} DZD`,
      icon: Package,
      cssClass: 'plan-stat',
    },
    {
      label: t('admin.formationSales'),
      value: `${formationCount} · ${formationRevenue.toLocaleString()} DZD`,
      icon: GraduationCap,
      cssClass: 'formation-stat',
    },
    {
      label: t('admin.aiTrackerSales'),
      value: `${aiCount} · ${aiRevenue.toLocaleString()} DZD`,
      icon: CreditCard,
      cssClass: 'ai-stat',
    },
    {
      label: t('admin.courseSubscriptions'),
      value: `${courseSubCount} · ${courseSubRevenue.toLocaleString()} DZD`,
      icon: BookOpen,
      cssClass: 'course-stat',
    },
    {
      label: t('admin.totalTransactions'),
      value: filteredPayments.length,
      icon: ArrowUpRight,
      cssClass: 'transactions-stat',
    },
  ];

  if (loading) return (
    <div className="ap-loading">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 12, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="ap-loading-icon"
      >
        <DollarSign size={48} />
      </motion.div>
      <p>{t('admin.loadingPaymentData')}</p>
    </div>
  );

  if (error) return (
    <div className="ap-error">
      <XCircle size={48} />
      <h3>{t('admin.unableToLoadPayments')}</h3>
      <p>{error}</p>
      <button onClick={fetchPayments} className="ap-retry-btn">{t('common.tryAgain')}</button>
    </div>
  );

  return (
    <div className="ap-container">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`ap-toast ap-toast--${toast.type}`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ap-modal-overlay"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="ap-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ap-modal-icon">
                <AlertTriangle size={28} />
              </div>
              <h3>{t('admin.deletePayment')}</h3>
              <p>{t('admin.deletePaymentConfirm', { amount: selectedPaymentAmount?.toLocaleString() })}</p>
              <p className="ap-modal-warning">{t('admin.deletePaymentWarning')}</p>
              <div className="ap-modal-actions">
                <button className="ap-btn ap-btn--ghost" onClick={() => setModalOpen(false)}>{t('common.cancel')}</button>
                <button className="ap-btn ap-btn--danger" onClick={confirmDelete} disabled={deletingId === selectedPaymentId}>
                  {deletingId === selectedPaymentId ? t('admin.deleting') : t('admin.yesDelete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ap-header">
        <div>
          <h1>{t('admin.paymentManagement')}</h1>
          <p className="ap-subtitle">{t('admin.monitorTransactions')}</p>
        </div>
        <button
          className={`ap-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={15} />
          {showFilters ? t('admin.hideFilters') : t('admin.filters')}
          <ChevronDown size={12} className={`ap-chevron ${showFilters ? 'open' : ''}`} />
        </button>
      </div>

      <div className="ap-stats">
        {statCards.map((card) => (
          <div key={card.label} className="ap-stat-card">
            <div className={`ap-stat-icon ${card.cssClass}`}>
              <card.icon size={22} />
            </div>
            <div className="ap-stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ap-filters"
          >
            <div className="ap-filters-inner">
              <div className="ap-filter-group">
                <label>{t('admin.type')}</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">{t('admin.allTypes')}</option>
                  <option value="Plan">{t('admin.planType')}</option>
                  <option value="Formation">{t('admin.formationType')}</option>
                  <option value="AI Tracker">{t('admin.aiTrackerType')}</option>
                  <option value="Course Subscription">{t('admin.courseSubType')}</option>
                </select>
              </div>
              <div className="ap-filter-group">
                <label>{t('common.search')}</label>
                <div className="ap-search-wrap">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder={t('admin.searchByNameOrEmail')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="ap-filter-group">
                <label>{t('admin.fromDate')}</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="ap-filter-group">
                <label>{t('admin.toDate')}</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <button className="ap-btn ap-btn--clear" onClick={clearFilters}>
                <X size={13} /> {t('admin.clear')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ap-results">
        <span>{t('admin.transactionsCount', { count: filteredPayments.length })}</span>
        {filteredPayments.length > 0 && (
          <span className="ap-results-revenue">
            <ArrowUpRight size={14} />
            {t('admin.totalRevenueAmount', { amount: totalRevenue.toLocaleString() })}
          </span>
        )}
      </div>

      {filteredPayments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ap-empty"
        >
          <div className="ap-empty-icon">
            <Search size={40} />
          </div>
          <h3>{t('admin.noPaymentsFound')}</h3>
          <p>{t('admin.adjustFilters')}</p>
        </motion.div>
      ) : (
        <div className="ap-list">
          {filteredPayments.map(p => {
            const typeCfg = TYPE_CONFIG[p.type] || TYPE_CONFIG.Plan;
            const MethodIcon = PAYMENT_METHOD_ICONS[p.paymentMethod] || Wallet;
            const initials = getInitials(p.user?.fullName);
            return (
              <div key={p._id} className="ap-card">
                <button
                  className="ap-delete-btn"
                  onClick={() => openDeleteModal(p._id, p.amount)}
                  disabled={deletingId === p._id}
                  title={t('admin.deletePayment')}
                >
                  {deletingId === p._id ? (
                    <span className="ap-spinner-sm" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>

                <div className="ap-card-top">
                  <div className="ap-card-user">
                    <div
                      className="ap-avatar"
                      style={{ background: typeCfg.gradient, color: typeCfg.color }}
                    >
                      {p.user?.photo ? (
                        <img src={p.user.photo} alt="" className="ap-avatar-img" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="ap-user-info">
                      <span className="ap-user-name">{p.user?.fullName || t('admin.unknownUser')}</span>
                      <span className="ap-user-email">{p.user?.email || '—'}</span>
                    </div>
                  </div>

                  <div className="ap-card-meta">
                    <span
                      className="ap-type-badge"
                      style={{ background: typeCfg.bg, color: typeCfg.color }}
                    >
                      <typeCfg.icon size={12} />
                      {p.type}
                    </span>
                    <span className="ap-method">
                      <MethodIcon size={12} />
                      {PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="ap-card-bottom">
                  <span className="ap-amount">{p.amount.toLocaleString()} DZD</span>
                  <span className="ap-date">
                    <Calendar size={12} />
                    {formatDate(p.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
