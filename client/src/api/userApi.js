import axiosInstance from './axiosInstance';

// Register client (replaces registerPatient)
export const registerClient = async (userData) => {
  const response = await axiosInstance.post("/user/register-client", userData);
  return response.data;
};

// Register staff (Admin or Nutritionist)
export const createStaffUser = async (userData) => {
  const response = await axiosInstance.post("/user/create-staff", userData);
  return response.data;
};

// Login user (works for all types)
export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/user/login", userData);
  
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// GET ALL USERS (basic info only)
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user/all");
  return response.data;
};

// Get all staff users only (Admin and Nutritionist)
export const getAllStaffUsers = async () => {
  const response = await axiosInstance.get("/user/staff");
  return response.data;
};

// Get all clients only (replaces getAllPatients)
export const getAllClients = async () => {
  const response = await axiosInstance.get("/user/clients");
  return response.data;
};

// Get single client by ID (optional - if you have this endpoint)
export const getClientById = async (clientId) => {
  const response = await axiosInstance.get(`/user/clients/${clientId}`);
  return response.data;
};

export const updateUser = async (userId, userData = {}, profilePicture = null) => {
  let data;
  let config = {};
  
  if (profilePicture instanceof File) {
    // Use FormData for file upload
    data = new FormData();
    
    // Append all user data fields
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        // Handle arrays (like medicalConditions, allergies)
        if (Array.isArray(userData[key])) {
          data.append(key, JSON.stringify(userData[key]));
        } else {
          data.append(key, userData[key]);
        }
      }
    });
    
    // Append profile picture
    data.append('profilePicture', profilePicture);
    
    config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  } else {
    // Regular JSON data
    data = userData;
  }
  
  const response = await axiosInstance.put(`/user/${userId}`, data, config);
  
  // Update localStorage with new user data if current user was updated
  if (response.data.user) {
    const currentUser = getCurrentUserFromStorage();
    if (currentUser && currentUser._id === userId) {
      // Merge with existing client profile if needed
      const updatedUser = {
        ...currentUser,
        ...response.data.user,
        clientProfile: response.data.user.clientProfile || currentUser.clientProfile
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }
  
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/user/${userId}`);
  return response.data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get current user from API (if you add /me endpoint)
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/user/me");
    localStorage.setItem("user", JSON.stringify(response.data));
    return { success: true, user: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user data' 
    };
  }
};

// Helper functions for role checks
export const isClient = (user) => {
  return user?.role === "Client";
};

export const isStaff = (user) => {
  return user?.role === "Admin" || user?.role === "Nutritionist";
};

export const isAdmin = (user) => {
  return user?.role === "Admin";
};

export const isNutritionist = (user) => {
  return user?.role === "Nutritionist";
};

// Get client profile from user object
export const getClientProfile = (user) => {
  return user?.clientProfile || null;
};

// Get user display name
export const getUserDisplayName = (user) => {
  return user?.fullName || user?.email || 'User';
};

// Get user role display text
export const getUserRoleDisplay = (user) => {
  const roleMap = {
    'Admin': 'Administrator',
    'Nutritionist': 'Nutritionist',
    'Client': 'Client'
  };
  return roleMap[user?.role] || user?.role || 'User';
};

// For backward compatibility (deprecated)
export const registerPatient = registerClient;
export const getAllPatients = getAllClients;