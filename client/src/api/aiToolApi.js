import axiosInstance from './axiosInstance';

export const getPlatformPaymentInfo = async () => {
  const response = await axiosInstance.get("/ai-tool/platform-payment-info");
  return response.data;
};

export const initiateAiToolSubscription = async (formData) => {
  const response = await axiosInstance.post("/ai-tool/subscribe", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const checkAiToolAccess = async () => {
  const response = await axiosInstance.get("/ai-tool/check-access");
  return response.data;
};

export const getMyAiToolSubscription = async () => {
  const response = await axiosInstance.get("/ai-tool/my-subscription");
  return response.data;
};

export const getPendingAiToolSubscriptions = async () => {
  const response = await axiosInstance.get("/admin/ai-tool-subscriptions/pending");
  return response.data;
};

export const approveAiToolSubscription = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/ai-tool-subscriptions/approve/${paymentId}`);
  return response.data;
};

export const rejectAiToolSubscription = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/ai-tool-subscriptions/reject/${paymentId}`);
  return response.data;
};
