import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStaffUser } from "../../api/userApi";
import "./AddAdminNutritionist.css";

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "dieteticien"
  });
  const [errors, setErrors] = useState({});

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createStaffUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      });
      
      showNotification(`${formData.role} account created successfully!`, "success");
      
      setFormData({ 
        fullName: "", 
        email: "", 
        password: "", 
        confirmPassword: "", 
        role: "dieteticien" 
      });
      
      setTimeout(() => {
        navigate("/admin/all-users");
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create user account";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const IconRole = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
      <path d="M2 17L12 22L22 17" />
      <path d="M2 12L12 17L22 12" />
    </svg>
  );

  const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div className="create-user-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`create-user-toast ${notification.type}`}>
          <div className="toast-content">
            {notification.type === "success" ? (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button className="toast-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Animated Background - Same as EditUserProfile */}
      <div className="create-user-background">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      <div className="create-user-container">
        <div className="create-user-header">
          <div className="header-badge">
            <IconUser />
            <span>User Management</span>
          </div>
          <h1>Create New User Account</h1>
          <p>Add administrators or Dieteticiens to manage your platform</p>
        </div>

        <div className="create-user-card">
          <form onSubmit={handleSubmit}>
            <div className="form-block">
              <div className="block-header">
                <div className="block-icon"><IconUser /></div>
                <div className="block-title">
                  <h2>Personal Information</h2>
                  <p>Enter the basic details for the new user</p>
                </div>
              </div>
              <div className="input-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g., Sarah Johnson"
                  className={errors.fullName ? "error" : ""}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="input-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sarah@example.com"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-block">
              <div className="block-header">
                <div className="block-icon"><IconRole /></div>
                <div className="block-title">
                  <h2>Select User Role</h2>
                  <p>Choose the appropriate access level for this user</p>
                </div>
              </div>
              <div className="role-options">
                <div
                  className={`role-option ${formData.role === "Admin" ? "active" : ""}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: "Admin" }))}
                >
                  <div className="role-header">
                    <h3>Administrator</h3>
                    <span className="role-tag admin">Admin Access</span>
                  </div>
                  <p>Full system access, user management, and platform configuration</p>
                  <div className="role-features">
                    <span>Full Control</span>
                    <span>User Management</span>
                    <span>System Settings</span>
                  </div>
                </div>
                <div
                  className={`role-option ${formData.role === "dieteticien" ? "active" : ""}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: "dieteticien" }))}
                >
                  <div className="role-header">
                    <h3>Dieteticien</h3>
                    <span className="role-tag Dieteticien">Professional Access</span>
                  </div>
                  <p>Manage clients, create meal plans, and track nutritional progress</p>
                  <div className="role-features">
                    <span>Client Management</span>
                    <span>Meal Planning</span>
                    <span>Nutrition Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-block">
              <div className="block-header">
                <div className="block-icon"><IconLock /></div>
                <div className="block-title">
                  <h2>Account Security</h2>
                  <p>Set a secure password for the user account</p>
                </div>
              </div>
              <div className="two-columns">
                <div className="input-field">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    className={errors.password ? "error" : ""}
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>
                <div className="input-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? "error" : ""}
                  />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => navigate("/admin/all-users")}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creating...
                  </>
                ) : (
                  "Create User Account"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="create-user-footer">
          <IconInfo />
          <p>New users will receive a welcome email with login instructions.</p>
        </div>
      </div>
    </div>
  );
};

export default AddUser;