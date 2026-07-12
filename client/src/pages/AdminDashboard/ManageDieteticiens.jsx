import React, { useState, useEffect } from 'react';
import { getPendingDieteticiens, approveDieteticien, rejectDieteticien } from '../../api/userApi';
import { Check, X, Eye, Loader, Clock, Shield, Mail, User, Stethoscope, GraduationCap, FileText } from 'lucide-react';
import { useSafeTimeout } from '../../hooks/useSafeTimeout';
import { useTranslation } from 'react-i18next';
import './ManageDieteticiens.css';

const ManageDieteticiens = () => {
  const { setTimeoutSafe } = useSafeTimeout();
  const { t } = useTranslation();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeoutSafe(() => setNotification(null), 3000);
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingDieteticiens();
      if (data.success) setPendingList(data.data);
    } catch (err) {
      showNotification(t('admin.loadRequestsFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const executeApprove = async (id) => {
    setActionLoading(id);
    setConfirmAction(null);
    try {
      const data = await approveDieteticien(id);
      if (data.success) {
        showNotification(data.message, 'success');
        setPendingList(prev => prev.filter(p => p._id !== id));
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification(t('admin.approveFailed'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const executeReject = async (id) => {
    setActionLoading(id);
    setConfirmAction(null);
    try {
      const data = await rejectDieteticien(id);
      if (data.success) {
        showNotification(data.message, 'success');
        setPendingList(prev => prev.filter(p => p._id !== id));
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification(t('admin.rejectFailed'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (id) => setConfirmAction({ id, type: 'approve' });
  const handleReject = (id) => setConfirmAction({ id, type: 'reject' });

  if (loading) return (
    <div className="manage-diet-loading">
      <div className="loading-spinner-ring"><Loader size={32} /></div>
      <p>{t('admin.loadingRequests')}</p>
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
          <h1>{t('admin.dieteticienRequests')}</h1>
          <p>{t('admin.dieteticienRequestsDescription')}</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-number">{pendingList.length}</span>
            <span className="stat-label">{t('common.pending')}</span>
          </div>
        </div>
      </div>

      {pendingList.length === 0 ? (
        <div className="manage-diet-empty">
          <div className="empty-icon-wrapper">
            <Shield size={48} />
          </div>
          <h3>{t('admin.allClear')}</h3>
          <p>{t('admin.allClearDescription')}</p>
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
                    <span className="status-dot"></span> {t('common.pending')}
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
                      <span>{t('admin.diplomaUploaded')}</span>
                      <button className="view-diploma-btn" onClick={() => setPreviewImg(item.diplomaUrl)}>
                        <Eye size={14} /> {t('admin.view')}
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
                    <Check size={16} />
                    {t('admin.approve')}
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => handleReject(item._id)}
                    disabled={actionLoading === item._id}
                  >
                    <X size={16} />
                    {t('admin.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {confirmAction && (
        <div className="manage-diet-modal" onClick={() => setConfirmAction(null)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className={`confirm-icon ${confirmAction.type}`}>
              {confirmAction.type === 'approve' ? <Check size={32} /> : <X size={32} />}
            </div>
            <h3>{confirmAction.type === 'approve' ? t('admin.approveRequest') : t('admin.rejectRequest')}</h3>
            <p>{t('admin.confirmActionMessage', { action: confirmAction.type })}</p>
            <div className="confirm-actions">
              <button
                className={`action-btn ${confirmAction.type}`}
                onClick={() => confirmAction.type === 'approve' ? executeApprove(confirmAction.id) : executeReject(confirmAction.id)}
                disabled={actionLoading === confirmAction.id}
              >
                {confirmAction.type === 'approve' ? <Check size={16} /> : <X size={16} />}
                {confirmAction.type === 'approve' ? t('admin.approve') : t('admin.reject')}
              </button>
              <button
                className="action-btn cancel-btn"
                onClick={() => setConfirmAction(null)}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImg && (
        <div className="manage-diet-modal" onClick={() => setPreviewImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewImg(null)}>&times;</button>
            <img src={previewImg} alt={t('admin.diplomaFull')} className="modal-image" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDieteticiens;
