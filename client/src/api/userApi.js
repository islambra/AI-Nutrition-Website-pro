import axiosInstance from './axiosInstance';

// Register client/student
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/user/register", userData);
  return response.data;
};

// Register client (backward compatible)
export const registerClient = async (userData) => {
  return registerUser(userData);
};

// Register dieteticien (with diploma upload)
export const registerDieteticien = async (formData) => {
  const response = await axiosInstance.post("/user/register-dieteticien", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Platform payment info (CCP / BaridiMob) for dieteticien registration fee
export const getPlatformPaymentInfo = async () => {
  const response = await axiosInstance.get("/user/platform-payment-info");
  return response.data;
};

// Register staff (Admin or Dieteticien)
export const createStaffUser = async (userData) => {
  const response = await axiosInstance.post("/user/create-staff", userData);
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

// GET ALL USERS (basic info only)
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user/all");
  return response.data;
};

// Get all staff users only (Admin and Dieteticien)
export const getAllStaffUsers = async () => {
  const response = await axiosInstance.get("/user/staff");
  return response.data;
};

// Get all clients/students
export const getAllClients = async () => {
  const response = await axiosInstance.get("/user/clients");
  return response.data;
};

// Update user
export const updateUser = async (userId, userData = {}, profilePicture = null) => {
  let data;
  let config = {};

  if (profilePicture instanceof File) {
    data = new FormData();

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        if (Array.isArray(userData[key])) {
          data.append(key, JSON.stringify(userData[key]));
        } else {
          data.append(key, userData[key]);
        }
      }
    });

    data.append('profilePicture', profilePicture);

    config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  } else {
    data = userData;
  }

  const response = await axiosInstance.put(`/user/${userId}`, data, config);

  if (response.data.user) {
    const currentUser = getCurrentUserFromStorage();
    if (currentUser && currentUser._id === userId) {
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

// Increment client consultations
export const incrementClientConsultations = async (clientId) => {
  const response = await axiosInstance.patch(`/user/client/${clientId}/increment-consultations`);
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

export const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get current user from API
export const getCurrentUser = async (options = {}) => {
  try {
    const response = await axiosInstance.get("/user/me", {
      signal: options.signal || undefined
    });
    localStorage.setItem("user", JSON.stringify(response.data));
    return { success: true, user: response.data };
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return { success: false, error: 'Request cancelled' };
    }
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user data'
    };
  }
};

// Helper functions for role checks
export const isClient = (user) => {
  return user?.role === "client";
};

export const isStudent = (user) => {
  return user?.role === "student";
};

export const isDieteticien = (user) => {
  return user?.role === "dieteticien";
};

export const isStaff = (user) => {
  return user?.role === "admin" || user?.role === "dieteticien";
};

export const isAdmin = (user) => {
  return user?.role === "admin";
};

// Backward compatibility
export const isNutritionist = isDieteticien;

// Get profile from user object
export const getClientProfile = (user) => {
  return user?.clientProfile || null;
};

export const getStudentProfile = (user) => {
  return user?.studentProfile || null;
};

export const getDieteticienProfile = (user) => {
  return user?.dieteticienProfile || null;
};

// Get user display name
export const getUserDisplayName = (user) => {
  return user?.fullName || user?.email || 'User';
};

// Get user role display text
export const getUserRoleDisplay = (user) => {
  const roleMap = {
    'admin': 'Administrator',
    'dieteticien': 'Dieteticien',
    'client': 'Client',
    'student': 'Student'
  };
  return roleMap[user?.role] || user?.role || 'User';
};

// For backward compatibility
export const registerPatient = registerUser;
export const getAllPatients = getAllClients;
// === Admin: Dieteticien Management ===

export const getPendingDieteticiens = async () => {
  const response = await axiosInstance.get('/admin/dieteticiens/pending');
  return response.data;
};

export const approveDieteticien = async (id) => {
  const response = await axiosInstance.post(`/admin/dieteticiens/approve/${id}`);
  return response.data;
};

export const rejectDieteticien = async (id) => {
  const response = await axiosInstance.delete(`/admin/dieteticiens/reject/${id}`);
  return response.data;
};
