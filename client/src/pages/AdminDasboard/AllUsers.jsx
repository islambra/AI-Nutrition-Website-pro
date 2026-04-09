// AllUsers.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../api/userApi";
import "./AllUsers.css";

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
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
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      console.log("All users from API:", response);
      
      // The API returns an array of users with role field
      // Roles: "Admin", "Nutritionist", "Client"
      setUsers(response);
      setFilteredUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (selectedRole !== "All") {
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
      showNotification("User deleted successfully", "success");
      fetchUsers(); // Refresh the list
      setDeleteConfirm(null);
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const getUserRole = (user) => {
    // Role is now consistently stored in user.role
    return user.role || "Client";
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
      case "Admin":
        return "role-badge-admin";
      case "Nutritionist":
        return "role-badge-nutritionist";
      case "Client":
        return "role-badge-client";
      default:
        return "role-badge-default";
    }
  };

  const getDisplayName = (user) => {
    if (user.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    return user.email ? user.email.split('@')[0] : "Unknown User";
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "Admin":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "Nutritionist":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "Client":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
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
      case "nutritionist":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "client":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
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
      default:
        return null;
    }
  };

  // Calculate stats based on users
  const getStats = () => {
    const admins = users.filter(u => u.role === "Admin").length;
    const nutritionists = users.filter(u => u.role === "Nutritionist").length;
    const clients = users.filter(u => u.role === "Client").length;
    return { admins, nutritionists, clients, total: users.length };
  };

  const stats = getStats();

  // Get client metrics from clientProfile
  const getClientMetrics = (user) => {
    if (user.role === "Client" && user.clientProfile) {
      return {
        bmi: user.clientProfile.bmi,
        age: user.clientProfile.age
      };
    }
    return null;
  };

  return (
    <div className="all-users-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            {notification.type === "success" ? (
              <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor"/>
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="modal-btn-cancel">
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(deleteConfirm.id)} className="modal-btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="users-header">
        <div>
          <h1>Manage Users</h1>
          <p>View and manage all administrators, nutritionists, and clients</p>
        </div>
        <button onClick={() => navigate("/admin/add-admin-nutritionist")} className="add-user-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add New User
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
            <p>Administrators</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon nutritionist-stat">
            {getStatIcon("nutritionist")}
          </div>
          <div className="stat-info">
            <h3>{stats.nutritionists}</h3>
            <p>Nutritionists</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon client-stat">
            {getStatIcon("client")}
          </div>
          <div className="stat-info">
            <h3>{stats.clients}</h3>
            <p>Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total-stat">
            {getStatIcon("total")}
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
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
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filters">
          <button
            className={`filter-btn ${selectedRole === "All" ? "active" : ""}`}
            onClick={() => setSelectedRole("All")}
          >
            All Users
          </button>
          <button
            className={`filter-btn ${selectedRole === "Admin" ? "active" : ""}`}
            onClick={() => setSelectedRole("Admin")}
          >
            Administrators
          </button>
          <button
            className={`filter-btn ${selectedRole === "Nutritionist" ? "active" : ""}`}
            onClick={() => setSelectedRole("Nutritionist")}
          >
            Nutritionists
          </button>
          <button
            className={`filter-btn ${selectedRole === "Client" ? "active" : ""}`}
            onClick={() => setSelectedRole("Client")}
          >
            Clients
          </button>
        </div>
      </div>

      {/* Users Count */}
      <div className="users-count">
        <span>{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found</span>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
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
                      <img src={user.photo} alt={getDisplayName(user)} />
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
                  <p className="user-email">{user.email || "No email provided"}</p>
                  <div className={`role-badge ${getRoleBadgeClass(getUserRole(user))}`}>
                    {getRoleIcon(getUserRole(user))}
                    <span>{getUserRole(user)}</span>
                  </div>
                  {/* Show client metrics if available */}
                  {user.role === "Client" && clientMetrics && (
                    <div className="client-metrics">
                      {clientMetrics.bmi && <span>BMI: {clientMetrics.bmi}</span>}
                      {clientMetrics.age && <span>Age: {clientMetrics.age}</span>}
                    </div>
                  )}
                </div>
                
                <div className="user-card-footer">
                  <span className="user-date">
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
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