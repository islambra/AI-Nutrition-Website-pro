import axiosInstance from './axiosInstance';

// Register user with all info
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/user/register", userData);
  return response.data;
};

// Register user with basic info only
export const registerBasicUser = async (userData) => {
  const response = await axiosInstance.post("/user/register-basic", userData);
  return response.data;
};

// Login user
export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/user/login", userData);
  
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Get current user data (using token)
export const getUserData = async () => {
  try {
    const response = await axiosInstance.get("/user/me");
    return { success: true, user: response.data };
  } catch (error) {
    console.error("Get user data error:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user data' 
    };
  }
};

// Get all users
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user/all-user");
  return response.data;
};

// Get all patients
export const getAllPatients = async () => {
  const response = await axiosInstance.get("/user/patients");
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
  
  // Update localStorage with new user data
  if (response.data.user) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser._id === userId) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }
  
  return response.data;
};


// Delete user
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

// Helper to get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};