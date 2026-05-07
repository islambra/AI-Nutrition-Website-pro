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