import { createContext, useContext, useState, useEffect } from "react";
import { getUserData } from "../api/userApi";

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
        const data = await getUserData();
        
        if (data.success && data.user) {
          setUser(data.user);
          // Sync user data with localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
          setAuthError(null);
        } else {
          // Token exists but is invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setAuthError("Session expired. Please login again.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setAuthError(error.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    setUser,
    logout,
    loading,
    authError,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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