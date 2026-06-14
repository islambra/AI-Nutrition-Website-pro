import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllPaymentsAdmin, deletePaymentAdmin } from '../../api/paymentApi';
import {
  Trash2, Search, Filter, Package, CreditCard, DollarSign,
  X, AlertTriangle, CheckCircle, XCircle,
  BookOpen, Calendar, ChevronDown, Wallet, ArrowUpRight
} from 'lucide-react';
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
      setError(err.response?.data?.message || 'Failed to load payments');
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
      showToast(`Payment of ${selectedPaymentAmount?.toLocaleString()} DZD deleted successfully`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
      setSelectedPaymentId(null);
      setSelectedPaymentAmount(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
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
  const aiCount = filteredPayments.filter(p => p.type === 'AI Tracker').length;
  const courseSubCount = filteredPayments.filter(p => p.type === 'Course Subscription').length;
  const planRevenue = filteredPayments.filter(p => p.type === 'Plan').reduce((sum, p) => sum + p.amount, 0);
  const aiRevenue = filteredPayments.filter(p => p.type === 'AI Tracker').reduce((sum, p) => sum + p.amount, 0);
  const courseSubRevenue = filteredPayments.filter(p => p.type === 'Course Subscription').reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} DZD`,
      icon: DollarSign,
      cssClass: 'total-stat',
    },
    {
      label: 'Plan Sales',
      value: `${planCount} · ${planRevenue.toLocaleString()} DZD`,
      icon: Package,
      cssClass: 'plan-stat',
    },
    {
      label: 'AI Tracker Sales',
      value: `${aiCount} · ${aiRevenue.toLocaleString()} DZD`,
      icon: CreditCard,
      cssClass: 'ai-stat',
    },
    {
      label: 'Course Subscriptions',
      value: `${courseSubCount} · ${courseSubRevenue.toLocaleString()} DZD`,
      icon: BookOpen,
      cssClass: 'course-stat',
    },
    {
      label: 'Total Transactions',
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
      <p>Loading payment data...</p>
    </div>
  );

  if (error) return (
    <div className="ap-error">
      <XCircle size={48} />
      <h3>Unable to load payments</h3>
      <p>{error}</p>
      <button onClick={fetchPayments} className="ap-retry-btn">Retry</button>
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
              <h3>Delete Payment</h3>
              <p>Are you sure you want to delete this payment of <strong>{selectedPaymentAmount?.toLocaleString()} DZD</strong>?</p>
              <p className="ap-modal-warning">This action cannot be undone. The user's access will be removed.</p>
              <div className="ap-modal-actions">
                <button className="ap-btn ap-btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="ap-btn ap-btn--danger" onClick={confirmDelete} disabled={deletingId === selectedPaymentId}>
                  {deletingId === selectedPaymentId ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ap-header">
        <div>
          <h1>Payment Management</h1>
          <p className="ap-subtitle">Monitor and manage all financial transactions</p>
        </div>
        <button
          className={`ap-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={15} />
          {showFilters ? 'Hide Filters' : 'Filters'}
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
                <label>Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="Plan">Plan</option>
                  <option value="AI Tracker">AI Tracker</option>
                  <option value="Course Subscription">Course Subscription</option>
                </select>
              </div>
              <div className="ap-filter-group">
                <label>Search</label>
                <div className="ap-search-wrap">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="ap-filter-group">
                <label>From</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="ap-filter-group">
                <label>To</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <button className="ap-btn ap-btn--clear" onClick={clearFilters}>
                <X size={13} /> Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ap-results">
        <span>{filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}</span>
        {filteredPayments.length > 0 && (
          <span className="ap-results-revenue">
            <ArrowUpRight size={14} />
            {totalRevenue.toLocaleString()} DZD total
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
          <h3>No payments found</h3>
          <p>Try adjusting your filters or search query</p>
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
                  title="Delete payment"
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
                      <span className="ap-user-name">{p.user?.fullName || 'Unknown User'}</span>
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
