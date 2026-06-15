import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Filter, Clock, XCircle, DollarSign, Trash2,
  CreditCard, Package, GraduationCap, BookOpen, Calendar,
  RefreshCw, Sparkles, Eye, Layers, AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { getMyRequests, deleteMyRequest } from '../api/paymentApi';
import toast from 'react-hot-toast';
import './PurchaseRequests.css';

const STATUS_CONFIG = {
  pending: { icon: Clock, label: 'Pending', className: 'status-pending' },
  rejected: { icon: XCircle, label: 'Rejected', className: 'status-rejected' }
};

const PurchaseRequests = ({ defaultType = 'all' }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(defaultType);
  const [statusFilter, setStatusFilter] = useState('pending-rejected');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyRequests();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleDelete = async (id, name) => {
    toast((t) => (
      <div className="pr-toast">
        <p>Delete request for <strong>{name}</strong>?</p>
        <div className="pr-toast-actions">
          <button onClick={() => { toast.dismiss(t.id); confirmDelete(id); }} className="pr-toast-confirm">Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="pr-toast-cancel">Cancel</button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const confirmDelete = async (id) => {
    try {
      await deleteMyRequest(id);
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter === 'pending-rejected') {
      result = result.filter(r => r.status === 'pending' || r.status === 'rejected');
    } else if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.serviceName.toLowerCase().includes(term) ||
        r.serviceType.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(r => r.serviceType === typeFilter);
    }

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? db - da : da - db;
    });

    return result;
  }, [requests, searchTerm, typeFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    return { total: pending + rejected, pending, rejected };
  }, [requests]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const typeOptions = [
    { value: 'all', label: 'All', icon: Layers },
    { value: 'plan', label: 'Plans', icon: Package },
    { value: 'formation', label: 'Formations', icon: GraduationCap },
    { value: 'course', label: 'Courses', icon: BookOpen }
  ];

  if (loading) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pr-loading">
      <div className="pr-loading-spinner">
        <div className="pr-spinner-ring"></div>
        <Sparkles className="pr-spinner-icon" size={28} />
      </div>
      <p>Loading your requests...</p>
    </motion.div>
  );

  if (error) return (
    <div className="pr-error">
      <div className="pr-error-icon"><AlertCircle size={48} /></div>
      <h3>Unable to load data</h3>
      <p>{error}</p>
      <button onClick={fetchRequests} className="pr-retry-btn">Try Again</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pr-container"
    >
      {/* Header */}
      <div className="pr-header">
        <div className="pr-header-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="pr-page-badge">
              <Clock size={14} />
              <span>My Requests</span>
            </div>
            <h1>Purchase Requests</h1>
            <p className="pr-subtitle">Track all your payment requests and their status</p>
          </motion.div>
        </div>
        <motion.div
          className="pr-header-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`pr-filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>
          <button onClick={refresh} className="pr-refresh-btn" disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'pr-spin' : ''} />
            Refresh
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        className="pr-stats-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="pr-stat-card">
          <div className="pr-stat-icon pr-total-icon"><Layers size={20} /></div>
          <div className="pr-stat-info">
            <span className="pr-stat-value">{stats.total}</span>
            <span className="pr-stat-label">Total Requests</span>
          </div>
        </div>
        <div className="pr-stat-card">
          <div className="pr-stat-icon pr-pending-icon"><Clock size={20} /></div>
          <div className="pr-stat-info">
            <span className="pr-stat-value">{stats.pending}</span>
            <span className="pr-stat-label">Pending</span>
          </div>
        </div>
        <div className="pr-stat-card">
          <div className="pr-stat-icon pr-rejected-icon"><XCircle size={20} /></div>
          <div className="pr-stat-info">
            <span className="pr-stat-value">{stats.rejected}</span>
            <span className="pr-stat-label">Rejected</span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="pr-search-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="pr-search-wrapper">
          <Search size={18} className="pr-search-icon" />
          <input
            type="text"
            placeholder="Search by service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="pr-clear-search">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="pr-search-info">
          <span>{filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found</span>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="pr-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pr-filter-inner">
              <div className="pr-filter-group">
                <label>Type</label>
                <div className="pr-filter-chips">
                  {typeOptions.map(t => (
                    <button
                      key={t.value}
                      className={`pr-chip ${typeFilter === t.value ? 'active' : ''}`}
                      onClick={() => setTypeFilter(t.value)}
                    >
                      <t.icon size={12} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pr-filter-group">
                <label>Status</label>
                <div className="pr-filter-chips">
                  {[
                    { value: 'pending-rejected', label: 'Pending & Rejected' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rejected', label: 'Rejected' }
                  ].map(s => (
                    <button
                      key={s.value}
                      className={`pr-chip ${statusFilter === s.value ? 'active' : ''}`}
                      onClick={() => setStatusFilter(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pr-filter-group">
                <label>Sort By</label>
                <div className="pr-filter-chips">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' }
                  ].map(s => (
                    <button
                      key={s.value}
                      className={`pr-chip ${sortBy === s.value ? 'active' : ''}`}
                      onClick={() => setSortBy(s.value)}
                    >
                      <ArrowUpDown size={12} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <motion.div
          className="pr-empty"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="pr-empty-icon"><Layers size={48} /></div>
          <h3>No requests found</h3>
          <p>
            {searchTerm || typeFilter !== defaultType || statusFilter !== 'pending-rejected'
              ? 'Try adjusting your filters or search term'
              : 'You have no pending or rejected requests.'}
          </p>
          {(searchTerm || typeFilter !== defaultType || statusFilter !== 'pending-rejected') && (
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter(defaultType); setStatusFilter('pending-rejected'); }}
              className="pr-clear-filters-btn"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="pr-grid">
          <AnimatePresence>
            {filteredRequests.map((req, index) => {
              const StatusIcon = STATUS_CONFIG[req.status].icon;
              return (
                <motion.div
                  key={req._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className="pr-card"
                >
                  <div className={`pr-card-top pr-border-${req.status}`}></div>
                  <div className="pr-card-content">
                    {/* Service Header */}
                    <div className="pr-service-header">
                      <div className="pr-service-icon">
                        {req.serviceType === 'plan' && <Package size={20} />}
                        {req.serviceType === 'formation' && <GraduationCap size={20} />}
                        {req.serviceType === 'course' && <BookOpen size={20} />}
                      </div>
                      <div className="pr-service-info">
                        <h3>{req.serviceName}</h3>
                        <span className="pr-service-type">
                          {req.serviceType === 'plan' ? 'Nutrition Plan' : req.serviceType === 'formation' ? 'Formation' : 'Course Subscription'}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="pr-details-row">
                      <div className="pr-detail-item">
                        <DollarSign size={14} />
                        <span>{req.amount.toLocaleString()} DZD</span>
                      </div>
                      <div className="pr-detail-item">
                        <CreditCard size={14} />
                        <span>{req.paymentMethod.toUpperCase()}</span>
                      </div>
                      <div className="pr-detail-item">
                        <Calendar size={14} />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="pr-card-footer">
                      <div className={`pr-status-badge ${STATUS_CONFIG[req.status].className}`}>
                        <StatusIcon size={14} />
                        <span>{STATUS_CONFIG[req.status].label}</span>
                      </div>
                      <div className="pr-card-actions">
                        {req.status === 'pending' && req.proofImage && (
                          <button
                            className="pr-action-btn"
                            onClick={() => setPreviewImage(req.proofImage)}
                            title="View proof"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {req.status === 'rejected' && (
                          <button
                            className="pr-action-btn pr-delete-btn"
                            onClick={() => handleDelete(req._id, req.serviceName)}
                            title="Delete request"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Proof Image Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="pr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              className="pr-modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="pr-modal-close" onClick={() => setPreviewImage(null)}>×</button>
              <img src={previewImage} alt="Payment proof" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PurchaseRequests;
