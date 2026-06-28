// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  loginUser as apiLoginUser,
  getCurrentUser,
  getCurrentUserFromStorage,
  logoutUser,
  isClient,
  isStudent,
  isStaff,
  isAdmin,
  isDieteticien,
  getClientProfile,
  getStudentProfile
} from "../api/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let cancelled = false;

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
        if (storedUser && !cancelled) {
          setUser(storedUser);
        }

        // Then verify with API
        const result = await getCurrentUser();

        if (cancelled) return;

        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem("user", JSON.stringify(result.user));
          setAuthError(null);
        } else {
          // Don't logout immediately if API fails - keep the stored user
          if ((result.error && result.error.includes("invalid")) || result.error?.includes("expired")) {
            console.warn("Token invalid/expired, logging out");
            logoutUser();
            setUser(null);
            setAuthError(result.error || "Session expired. Please login again.");
          } else {
            console.warn("API verification failed, but keeping stored user:", result.error);
            setAuthError(null);
          }
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch user data:", error);
        if (error.response?.status === 401) {
          logoutUser();
          setUser(null);
          setAuthError(error.message || "Authentication failed");
        } else {
          console.log("Network error, using cached user data");
          setAuthError(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => { cancelled = true; };
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
    const mergedUser = {
      ...user,
      ...updatedUser,
      clientProfile: updatedUser.clientProfile || user?.clientProfile,
      dieteticienProfile: updatedUser.dieteticienProfile || user?.dieteticienProfile
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

  // Stable booleans derived from user state — prevents infinite useEffect loops in consumers
  const isAdminValue = !!user && isAdmin(user);
  const isDieteticienValue = !!user && isDieteticien(user);
  const isClientValue = !!user && isClient(user);
  const isStudentValue = !!user && isStudent(user);
  const isStaffValue = !!user && isStaff(user);
  const userType = user?.role || null;

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    logout,
    loading,
    authError,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
    isAdmin: isAdminValue,
    isDieteticien: isDieteticienValue,
    isClient: isClientValue,
    isStudent: isStudentValue,
    isStaff: isStaffValue,
    isNutritionist: isDieteticienValue,
    isPatient: isClientValue,
    userType,
  }), [user, loading, authError, isAdminValue, isDieteticienValue, isClientValue, isStudentValue, isStaffValue, userType]);

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