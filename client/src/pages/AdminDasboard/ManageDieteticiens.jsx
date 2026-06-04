import React, { useState, useEffect } from 'react';
import { getPendingDieteticiens, approveDieteticien, rejectDieteticien } from '../../api/userApi';
import { Check, X, Eye, Loader, Clock, Shield, Mail, User, Stethoscope, GraduationCap, FileText } from 'lucide-react';
import './ManageDieteticiens.css';

const ManageDieteticiens = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingDieteticiens();
      if (data.success) setPendingList(data.data);
    } catch (err) {
      showNotification('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const data = await approveDieteticien(id);
      if (data.success) {
        showNotification(data.message, 'success');
        setPendingList(prev => prev.filter(p => p._id !== id));
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    setActionLoading(id);
    try {
      const data = await rejectDieteticien(id);
      if (data.success) {
        showNotification(data.message, 'success');
        setPendingList(prev => prev.filter(p => p._id !== id));
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Failed to reject', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="manage-diet-loading">
      <div className="loading-spinner-ring"><Loader size={32} /></div>
      <p>Loading requests...</p>
    </div>
  );

  return (
    <div className="manage-diet-container">
      {notification && (
        <div className={`manage-diet-toast ${notification.type}`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}

      <div className="manage-diet-header">
        <div className="header-left">
          <h1>Dieteticien Requests</h1>
          <p>Review and manage dieteticien registration requests</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-number">{pendingList.length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {pendingList.length === 0 ? (
        <div className="manage-diet-empty">
          <div className="empty-icon-wrapper">
            <Shield size={48} />
          </div>
          <h3>All Clear</h3>
          <p>All dieteticien registration requests have been processed.</p>
        </div>
      ) : (
        <>
          <div className="manage-diet-list">
            {pendingList.map((item, index) => (
              <div key={item._id} className="manage-diet-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="card-top">
                  <div className="card-avatar">
                    <User size={24} />
                  </div>
                  <div className="card-info">
                    <h3>{item.fullName}</h3>
                    <div className="card-meta">
                      <span><Mail size={12} /> {item.email}</span>
                      <span><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="card-status">
                    <span className="status-dot"></span> Pending
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-tags">
                    <span className="tag tag-age">{item.age} years</span>
                    <span className="tag tag-gender">{item.gender}</span>
                    <span className="tag tag-specialty"><Stethoscope size={12} /> {item.specialty}</span>
                  </div>
                  {item.diplomaUrl && (
                    <div className="card-diploma">
                      <FileText size={14} />
                      <span>Diploma uploaded</span>
                      <button className="view-diploma-btn" onClick={() => setPreviewImg(item.diplomaUrl)}>
                        <Eye size={14} /> View
                      </button>
                    </div>
                  )}
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn approve"
                    onClick={() => handleApprove(item._id)}
                    disabled={actionLoading === item._id}
                  >
                    {actionLoading === item._id ? <Loader size={16} className="spin" /> : <Check size={16} />}
                    Approve
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => handleReject(item._id)}
                    disabled={actionLoading === item._id}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {previewImg && (
        <div className="manage-diet-modal" onClick={() => setPreviewImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewImg(null)}>&times;</button>
            <img src={previewImg} alt="Diploma full" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDieteticiens;
