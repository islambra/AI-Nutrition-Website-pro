// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { 
  loginUser as apiLoginUser, 
  getCurrentUser, 
  getCurrentUserFromStorage,
  logoutUser,
  isClient,
  isStaff,
  isAdmin,
  isNutritionist,
  getClientProfile
} from "../api/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }
      
      try {
        // Try to get user from localStorage first for faster loading
        const storedUser = getCurrentUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Then verify with API
        const result = await getCurrentUser();
        
        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem("user", JSON.stringify(result.user));
          setAuthError(null);
        } else {
          // Don't logout immediately if API fails - keep the stored user
          // Only logout if the API explicitly says token is invalid
          if (result.error && result.error.includes("invalid") || result.error?.includes("expired")) {
            console.warn("Token invalid/expired, logging out");
            logoutUser();
            setUser(null);
            setAuthError(result.error || "Session expired. Please login again.");
          } else {
            // API might be temporarily unavailable, keep the stored user
            console.warn("API verification failed, but keeping stored user:", result.error);
            setAuthError(null); // Clear error to not block user
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Don't logout on network errors - keep the stored user
        // Only clear if it's an authentication error
        if (error.response?.status === 401) {
          logoutUser();
          setUser(null);
          setAuthError(error.message || "Authentication failed");
        } else {
          // Keep the user from localStorage on network errors
          console.log("Network error, using cached user data");
          setAuthError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setAuthError(null);
      setLoading(true);
      
      const response = await apiLoginUser({ email, password });
      
      if (response.token && response.user) {
        setUser(response.user);
        setAuthError(null);
        return { success: true, user: response.user };
      } else {
        setAuthError(response.message || "Login failed");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed";
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    logoutUser();
    setUser(null);
    setAuthError(null);
  };

  // Update user in state and storage
  const updateUser = (updatedUser) => {
    // Ensure we preserve the clientProfile if it's missing in the update but exists in current state
    const mergedUser = {
      ...user,
      ...updatedUser,
      clientProfile: updatedUser.clientProfile || user?.clientProfile
    };
    setUser(mergedUser);
    localStorage.setItem("user", JSON.stringify(mergedUser));
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    
    const userRole = user.role;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  };

  // Check if user is admin
  const checkIsAdmin = () => {
    return isAdmin(user);
  };

  // Check if user is nutritionist
  const checkIsNutritionist = () => {
    return isNutritionist(user);
  };

  // Check if user is client
  const checkIsClient = () => {
    return isClient(user);
  };

  // Check if user is staff (Admin or Nutritionist)
  const checkIsStaff = () => {
    return isStaff(user);
  };

  // Get client profile if user is client
  const clientProfile = () => {
    return getClientProfile(user);
  };

  // Get user type for display
  const getUserType = () => {
    if (!user) return null;
    return user.role || "Client";
  };

  // For backward compatibility
  const isPatient = checkIsClient;
  const patientProfile = clientProfile;

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    authError,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
    isAdmin: checkIsAdmin,
    isNutritionist: checkIsNutritionist,
    isClient: checkIsClient,
    isStaff: checkIsStaff,
    clientProfile,
    // Backward compatibility
    isPatient,
    patientProfile,
    userType: getUserType(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;