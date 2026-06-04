// api/paymentApi.js
import axiosInstance from './axiosInstance';

// Buy a plan
export const buyPlan = async (planId, paymentMethod = "credit_card") => {
  const response = await axiosInstance.post("/payments/buy", {
    planId,
    paymentMethod
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
// Add to existing paymentApi.js
export const getAllPaymentsAdmin = async () => {
  const response = await axiosInstance.get('/admin/payments');
  return response.data;
};

export const deletePaymentAdmin = async (paymentId) => {
  const response = await axiosInstance.delete(`/admin/payments/${paymentId}`);
  return response.data;
};

export const getDieteticienPlanPayments = async () => {
  const response = await axiosInstance.get('/dieteticien/payments/my-plan-payments');
  return response.data;
};
export const getNutritionistPlanPayments = getDieteticienPlanPayments;