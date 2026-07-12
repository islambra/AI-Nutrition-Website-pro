import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../api/userApi";
import { AlertTriangle, X } from "lucide-react";
import { useSafeTimeout } from "../../hooks/useSafeTimeout";
import { useTranslation } from 'react-i18next';
import "./AllUsers.css";

const AllUsers = () => {
  const { t } = useTranslation();
  const { setTimeoutSafe } = useSafeTimeout();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeoutSafe(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification(t('admin.failedToLoadUsers'), "error");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user && (
          (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      showNotification(t('admin.userDeletedSuccess'), "success");
      fetchUsers();
      setDeleteConfirm(null);
    } catch (error) {
      showNotification(error.response?.data?.message || t('admin.failedToDeleteUser'), "error");
    }
  };

  const getUserRole = (user) => {
    return user.role || "";
  };

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
      return "U";
    }
    return fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case "admin": return "role-badge-admin";
      case "dieteticien": return "role-badge-dieteticien";
      case "client": return "role-badge-client";
      case "student": return "role-badge-student";
      default: return "role-badge-default";
    }
  };

  const getDisplayName = (user) => {
    if (user.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    return user.email ? user.email.split('@')[0] : t('admin.unknownUser');
  };

  const roleDisplayMap = {
    admin: t('admin.administrator'),
    dieteticien: t('admin.dieteticien'),
    client: t('admin.client'),
    student: t('admin.student'),
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "admin":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "dieteticien":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 7H19L18 21H6L5 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "client":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "student":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9V14.5C6 17.5 8.7 20 12 20C15.3 20 18 17.5 18 14.5V9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default: return null;
    }
  };

  const getStatIcon = (type) => {
    switch(type) {
      case "admin":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "dieteticien":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 7H19L18 21H6L5 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "client":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "student":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9V14.5C6 17.5 8.7 20 12 20C15.3 20 18 17.5 18 14.5V9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "total":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 16.8 15.2 15 13 15H5C2.8 15 1 16.8 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21V19C22.8 17 21.2 15.2 19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 3.13C18.2 3.51 19.8 5.4 20 7.63" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default: return null;
    }
  };

  const getStats = () => {
    const admins = users.filter(u => u.role === "admin").length;
    const dieteticiens = users.filter(u => u.role === "dieteticien").length;
    const clients = users.filter(u => u.role === "client").length;
    const students = users.filter(u => u.role === "student").length;
    return { admins, dieteticiens, clients, students, total: users.length };
  };

  const stats = getStats();

  const getClientMetrics = (user) => {
    if (user.role === "client" && user.clientProfile) {
      return {
        bmi: user.clientProfile.bmi,
        age: user.clientProfile.age
      };
    }
    return null;
  };

  return (
    <div className="all-users-container">
      {/* Animated Background */}
      <div className="all-users-background">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`notification-toast ${notification.type}`}
          >
            <div className="notification-content">
              <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {notification.type === "success" ? (
                  <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
                  </>
                )}
              </svg>
              <span>{notification.message}</span>
            </div>
            <button className="notification-close" onClick={() => setNotification(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon">
                <AlertTriangle size={28} />
              </div>
              <h3>{t('admin.deleteUser')}</h3>
              <p>{t('admin.deleteConfirmMessage', { name: deleteConfirm.fullName })}</p>
              <div className="modal-actions">
                <button onClick={() => setDeleteConfirm(null)} className="modal-btn-cancel">
                  {t('common.cancel')}
                </button>
                <button onClick={() => handleDeleteUser(deleteConfirm.id)} className="modal-btn-delete">
                  {t('admin.confirmDelete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="users-header">
        <div>
          <div className="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{t('admin.userManagement')}</span>
          </div>
          <h1>{t('admin.manageUsers')}</h1>
          <p>{t('admin.manageUsersDescription')}</p>
        </div>
        <button onClick={() => navigate("/admin/add-admin-nutritionist")} className="add-user-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {t('admin.addNewUser')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon admin-stat">
            {getStatIcon("admin")}
          </div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>{t('admin.administrators')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon dieteticien-stat">
            {getStatIcon("dieteticien")}
          </div>
          <div className="stat-info">
            <h3>{stats.dieteticiens}</h3>
            <p>{t('admin.dieteticiens')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon client-stat">
            {getStatIcon("client")}
          </div>
          <div className="stat-info">
            <h3>{stats.clients}</h3>
            <p>{t('admin.clients')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon student-stat">
            {getStatIcon("student")}
          </div>
          <div className="stat-info">
            <h3>{stats.students}</h3>
            <p>{t('admin.students')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-stat">
            {getStatIcon("total")}
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>{t('admin.totalUsers')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder={t('admin.searchByNameOrEmail')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filters">
          <button
            className={`filter-btn ${selectedRole === "all" ? "active" : ""}`}
            onClick={() => setSelectedRole("all")}
          >
            {t('common.all')}
          </button>
          <button
            className={`filter-btn ${selectedRole === "admin" ? "active" : ""}`}
            onClick={() => setSelectedRole("admin")}
          >
            {t('admin.administrators')}
          </button>
          <button
            className={`filter-btn ${selectedRole === "dieteticien" ? "active" : ""}`}
            onClick={() => setSelectedRole("dieteticien")}
          >
            {t('admin.dieteticiens')}
          </button>
          <button
            className={`filter-btn ${selectedRole === "client" ? "active" : ""}`}
            onClick={() => setSelectedRole("client")}
          >
            {t('admin.clients')}
          </button>
          <button
            className={`filter-btn ${selectedRole === "student" ? "active" : ""}`}
            onClick={() => setSelectedRole("student")}
          >
            {t('admin.students')}
          </button>
        </div>
      </div>

      {/* Users Count */}
      <div className="users-count">
        <span>{t('admin.usersFound', { count: filteredUsers.length })}</span>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('admin.loadingUsers')}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>{t('admin.noUsersFound')}</h3>
          <p>{t('admin.adjustSearchOrFilters')}</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => {
            const clientMetrics = getClientMetrics(user);
            return (
              <div key={user._id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.photo ? (
                      <img src={user.photo} alt={getDisplayName(user)} loading="lazy" />
                    ) : (
                      <div className="avatar-placeholder">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteConfirm({ 
                      id: user._id, 
                      fullName: getDisplayName(user) 
                    })}
                    className="delete-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 7L6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19L19 7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 7V4C9 3.4 9.4 3 10 3H14C14.6 3 15 3.4 15 4V7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                
                <div className="user-card-body">
                  <h3>{getDisplayName(user)}</h3>
                  <p className="user-email">{user.email || t('admin.noEmailProvided')}</p>
                  <div className={`role-badge ${getRoleBadgeClass(getUserRole(user))}`}>
                    {getRoleIcon(getUserRole(user))}
                    <span>{roleDisplayMap[getUserRole(user)] || getUserRole(user)}</span>
                  </div>
                  {user.role === "client" && clientMetrics && (
                    <div className="client-metrics">
                      {clientMetrics.bmi && <span>BMI: {clientMetrics.bmi}</span>}
                      {clientMetrics.age && <span>Age: {clientMetrics.age}</span>}
                    </div>
                  )}
                </div>
                
                <div className="user-card-footer">
                  <span className="user-date">
                    {t('admin.joined')} {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('admin.recently')}
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

export default AllUsers;