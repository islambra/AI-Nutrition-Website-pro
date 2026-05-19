import React, { useState, useEffect } from 'react';
import { getAllPaymentsAdmin, deletePaymentAdmin } from '../../api/paymentApi';
import { Trash2, Search, Filter, DollarSign, CreditCard, Package, TrendingUp, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import './AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentAmount, setSelectedPaymentAmount] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Filter states
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
      start.setHours(0,0,0,0);
      filtered = filtered.filter(p => new Date(p.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
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

  // Open confirmation modal
  const openDeleteModal = (id, amount) => {
    setSelectedPaymentId(id);
    setSelectedPaymentAmount(amount);
    setModalOpen(true);
  };

  // Execute delete
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

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  // Stats
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const planCount = filteredPayments.filter(p => p.type === 'Plan').length;
  const aiCount = filteredPayments.filter(p => p.type === 'AI Tracker').length;
  const planRevenue = filteredPayments.filter(p => p.type === 'Plan').reduce((sum, p) => sum + p.amount, 0);
  const aiRevenue = filteredPayments.filter(p => p.type === 'AI Tracker').reduce((sum, p) => sum + p.amount, 0);

  if (loading) return (
    <div className="admin-loading">
      <div className="loading-spinner"></div>
      <p>Loading payment data...</p>
    </div>
  );
  
  if (error) return (
    <div className="admin-error">
      <div className="error-icon"> </div>
      <h3>Unable to load payments</h3>
      <p>{error}</p>
      <button onClick={fetchPayments} className="retry-btn">Retry</button>
    </div>
  );

  return (
    <div className="admin-payments-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Delete Payment</h3>
            <p>Are you sure you want to delete this payment of <strong>{selectedPaymentAmount?.toLocaleString()} DZD</strong>?</p>
            <p className="modal-warning">This action cannot be undone. The user's access will be removed.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="modal-btn delete" onClick={confirmDelete} disabled={deletingId === selectedPaymentId}>
                {deletingId === selectedPaymentId ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Payment Management</h1>
          <p className="subtitle">Monitor and manage all financial transactions</p>
        </div>
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><DollarSign size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{totalRevenue.toLocaleString()} DZD</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Package size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Plan Sales</span>
            <span className="stat-value">{planCount}</span>
            <span className="stat-sub">{planRevenue.toLocaleString()} DZD</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><CreditCard size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">AI Tracker Sales</span>
            <span className="stat-value">{aiCount}</span>
            <span className="stat-sub">{aiRevenue.toLocaleString()} DZD</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{filteredPayments.length}</span>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Payment Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Plan">Plan</option>
              <option value="AI Tracker">AI Tracker</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Search User</label>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="clear-filters-btn" onClick={clearFilters}>
            <X size={16} /> Clear
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="results-info">
        <span>{filteredPayments.length} transaction(s) found</span>
      </div>

      {/* Table */}
      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Type</th>
              <th>Amount (DZD)</th>
              <th>Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr><td colSpan="7" className="no-data">No payments match your filters</td></tr>
            ) : (
              filteredPayments.map(p => (
                <tr key={p._id}>
                  <td data-label="User">{p.user?.fullName || '—'}</td>
                  <td data-label="Email">{p.user?.email || '—'}</td>
                  <td data-label="Type">
                    <span className={`type-badge ${p.type === 'Plan' ? 'plan' : 'ai'}`}>{p.type}</span>
                  </td>
                  <td data-label="Amount"><strong>{p.amount.toLocaleString()}</strong></td>
                  <td data-label="Method" className="capitalize">{p.paymentMethod}</td>
                  <td data-label="Date">{formatDate(p.createdAt)}</td>
                  <td data-label="Actions">
                    <button 
                      className="delete-btn" 
                      onClick={() => openDeleteModal(p._id, p.amount)} 
                      disabled={deletingId === p._id}
                    >
                      <Trash2 size={16} /> {deletingId === p._id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;