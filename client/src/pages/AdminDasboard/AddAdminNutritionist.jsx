// AddAdminNutritionist.jsx
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
    role: "Nutritionist"
  });
  const [errors, setErrors] = useState({});

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
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
      // Use createStaffUser instead of registerBasicUser
      const response = await createStaffUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      });
      
      console.log('Staff user created:', response);
      
      showNotification(`${formData.role} account created successfully!`, "success");
      
      // Reset form
      setFormData({ 
        fullName: "", 
        email: "", 
        password: "", 
        confirmPassword: "", 
        role: "Nutritionist" 
      });
      
      // Navigate after 1.5 seconds
      setTimeout(() => {
        navigate("/admin/all-users");
      }, 1500);
      
    } catch (error) {
      console.error('Error creating staff user:', error);
      const errorMessage = error.response?.data?.message || "Failed to create user account";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-dashboard">
      <div className="dashboard-container">
        {/* Notification Toast */}
        {notification && (
          <div className={`notification-toast ${notification.type}`}>
            <div className="notification-content">
              {notification.type === "success" ? (
                <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1>Create New User Account</h1>
            <p>Add administrators or nutritionists to manage your platform</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="form-main-card">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="section-content">
                <h2>Personal Information</h2>
                <p>Enter the basic details for the new user</p>
                
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g., Sarah Johnson"
                    className={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@example.com"
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="form-section">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="section-content">
                <h2>Select User Role</h2>
                <p>Choose the appropriate access level for this user</p>
                
                <div className="role-grid">
                  <div
                    className={`role-card ${formData.role === "Admin" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: "Admin" }))}
                  >
                    <div className="role-card-header">
                      <h3>Administrator</h3>
                      <span className="role-badge">Admin Access</span>
                    </div>
                    <p>Full system access, user management, and platform configuration</p>
                    <div className="role-features">
                      <span>✓ Full Control</span>
                      <span>✓ User Management</span>
                      <span>✓ System Settings</span>
                    </div>
                  </div>

                  <div
                    className={`role-card ${formData.role === "Nutritionist" ? "active" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: "Nutritionist" }))}
                  >
                    <div className="role-card-header">
                      <h3>Nutritionist</h3>
                      <span className="role-badge">Professional Access</span>
                    </div>
                    <p>Manage patients, create meal plans, and track nutritional progress</p>
                    <div className="role-features">
                      <span>✓ Patient Management</span>
                      <span>✓ Meal Planning</span>
                      <span>✓ Nutrition Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M19 10.5V17.5L12 21L5 17.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="section-content">
                <h2>Account Security</h2>
                <p>Set a secure password for the user account</p>
                
                <div className="password-grid">
                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      className={errors.password ? "error" : ""}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={errors.confirmPassword ? "error" : ""}
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate("/admin/all-users")} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating Account..." : "Create User Account"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="info-note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor"/>
          </svg>
          <p>New users will receive a welcome email with login instructions.</p>
        </div>
      </div>
    </div>
  );
};

export default AddUser;