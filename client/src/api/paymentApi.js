import axiosInstance from './axiosInstance';

// Initiate offline payment with proof image (works for both plans and formations)
export const initiatePayment = async (formData) => {
  const response = await axiosInstance.post("/payments/buy", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Check if user owns a plan
export const checkPlanOwnership = async (planId) => {
  const response = await axiosInstance.get(`/payments/check/${planId}`);
  return response.data;
};

// Get user's purchased plans
export const getUserPlans = async () => {
  const response = await axiosInstance.get("/payments/my-plans");
  return response.data;
};

// Dieteticien: get pending payments
export const getPendingPayments = async () => {
  const response = await axiosInstance.get("/payments/offline/pending");
  return response.data;
};

// Dieteticien: approve a pending payment
export const approvePayment = async (paymentId) => {
  const response = await axiosInstance.post(`/payments/offline/approve/${paymentId}`);
  return response.data;
};

// Dieteticien: reject a pending payment
export const rejectPayment = async (paymentId) => {
  const response = await axiosInstance.post(`/payments/offline/reject/${paymentId}`);
  return response.data;
};

// Get all payment requests for the logged-in user
export const getMyRequests = async () => {
  const response = await axiosInstance.get('/payments/my-requests');
  return response.data;
};

// Delete a user's own rejected payment request
export const deleteMyRequest = async (requestId) => {
  const response = await axiosInstance.delete(`/payments/my-requests/${requestId}`);
  return response.data;
};

// Get a dieteticien's payment info (CCP, BaridiMob) by user ID
export const getDieteticienPaymentInfo = async (dieteticienId) => {
  const response = await axiosInstance.get(`/user/${dieteticienId}/payment-info`);
  return response.data;
};

// Admin: get all payments
export const getAllPaymentsAdmin = async () => {
  const response = await axiosInstance.get('/admin/payments');
  return response.data;
};

// Admin: delete payment
export const deletePaymentAdmin = async (paymentId) => {
  const response = await axiosInstance.delete(`/admin/payments/${paymentId}`);
  return response.data;
};

// Admin: get platform payment settings (CCP, BaridiMob)
export const getPlatformPaymentSettings = async () => {
  const response = await axiosInstance.get('/admin/platform-payment-info');
  return response.data;
};

// Admin: update platform payment settings
export const updatePlatformPaymentSettings = async (data) => {
  const response = await axiosInstance.put('/admin/platform-payment-info', data);
  return response.data;
};

// Dieteticien: get plan payments (for sales history)
export const getDieteticienPlanPayments = async () => {
  const response = await axiosInstance.get('/dieteticien/payments/my-plan-payments');
  return response.data;
};
export const getNutritionistPlanPayments = getDieteticienPlanPayments;
