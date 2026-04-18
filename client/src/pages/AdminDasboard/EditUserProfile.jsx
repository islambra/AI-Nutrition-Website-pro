import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import "./EditUserProfile.css";

const EditUserProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo: null
  });
  const [originalData, setOriginalData] = useState({
    fullName: "",
    email: ""
  });
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user data:", parsedUser);
        setUserRole(parsedUser.role || "");
        loadUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else if (user) {
      setUserRole(user.role || "");
      loadUserData(user);
    } else {
      showNotification("Please login to access this page", "error");
      navigate("/login");
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadUserData = (userData) => {
    if (!userData) return;
    
    const userName = userData.fullName || userData.name || "";
    const userEmail = userData.email || "";
    
    console.log("Loading - FullName:", userName);
    console.log("Loading - Email:", userEmail);
    
    setFormData({
      fullName: userName,
      email: userEmail,
      password: "",
      confirmPassword: "",
      photo: null
    });
    setOriginalData({
      fullName: userName,
      email: userEmail
    });
    setCurrentPhoto(userData.photo);
    setPhotoPreview(userData.photo);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification("Only image files are allowed (JPEG, PNG, GIF, WEBP)", "error");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showNotification("File size must be less than 5MB", "error");
        return;
      }
      
      setFormData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        showNotification("User data not found", "error");
        navigate("/login");
        return;
      }
      
      const currentUser = JSON.parse(storedUser);
      const userId = currentUser._id || currentUser.id;
      
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
      };
      
      if (formData.password) {
        userData.password = formData.password;
      }
      
      console.log("Updating user with data:", userData);
      
      const response = await updateUser(userId, userData, formData.photo);
      
      console.log("Update response:", response);
      
      const updatedUserData = {
        ...currentUser,
        fullName: formData.fullName,
        email: formData.email,
      };
      
      if (response.user) {
        updateAuthUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        if (formData.photo && photoPreview) {
          updatedUserData.photo = photoPreview;
        }
        updateAuthUser(updatedUserData);
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
      
      setOriginalData({
        fullName: formData.fullName,
        email: formData.email
      });
      setCurrentPhoto(photoPreview);
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
        photo: null
      }));
      
      scrollToTop();
      showNotification("Profile updated successfully!", "success");
      
    } catch (error) {
      console.error("Update error:", error);
      showNotification(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return formData.fullName !== originalData.fullName ||
           formData.email !== originalData.email ||
           formData.password !== "" ||
           formData.photo !== null;
  };

  const getRoleDisplay = () => {
    const roleMap = {
      'Admin': 'Administrator',
      'Nutritionist': 'Nutritionist',
      'Client': 'Client'
    };
    return roleMap[userRole] || userRole;
  };

  return (
    <div className="edit-profile-container" ref={topRef}>
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

      <div className="edit-profile-background">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>
      
      <div className="edit-profile-header">
        <div className="header-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile Settings</span>
        </div>
        <h1>Edit Profile</h1>
        <p>Update your personal information and profile picture</p>
        {userRole && (
          <div className="staff-badge">
            <span>{getRoleDisplay()} Account</span>
          </div>
        )}
      </div>

      <div className="edit-profile-card">
        <form onSubmit={handleSubmit}>
          {/* Profile Photo Section */}
          <div className="photo-section">
            <div className="photo-upload">
              <div className="current-photo">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" />
                ) : (
                  <div className="photo-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" />
                    </svg>
                  </div>
                )}
                <label htmlFor="photo" className="photo-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Change</span>
                </label>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="photo-info">
                <h4>Profile Picture</h4>
                <p>JPG, GIF or PNG. Max size 5MB.</p>
                {currentPhoto && !formData.photo && (
                  <span className="current-badge">Current photo active</span>
                )}
                {formData.photo && (
                  <span className="new-badge">New photo selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="section-title">
                <h3>Personal Information</h3>
                <p>Update your basic personal details</p>
              </div>
            </div>
            
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "error" : ""}
                />
                {formData.fullName !== originalData.fullName && (
                  <div className="input-status changed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? "error" : ""}
                />
                {formData.email !== originalData.email && (
                  <div className="input-status changed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="section-title">
                <h3>Security</h3>
                <p>Change your password to keep your account secure</p>
              </div>
            </div>
            
            <div className="password-grid">
              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (min. 6 characters)"
                    className={errors.password ? "error" : ""}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className={errors.confirmPassword ? "error" : ""}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading || !hasChanges()}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            {hasChanges() && (
              <div className="unsaved-badge">
                <div className="unsaved-dot"></div>
                You have unsaved changes
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserProfile;