import axiosInstance from './axiosInstance';

export const getAllDieteticiens = async () => {
  const response = await axiosInstance.get('/dieteticien-subscriptions/dieteticiens');
  return response.data;
};

export const getDieteticienById = async (id) => {
  const response = await axiosInstance.get(`/dieteticien-subscriptions/dieteticiens/${id}`);
  return response.data;
};

export const subscribe = async (formData) => {
  const response = await axiosInstance.post('/dieteticien-subscriptions/subscribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMySubscriptions = async () => {
  const response = await axiosInstance.get('/dieteticien-subscriptions/my');
  return response.data;
};

export const getSubscribers = async () => {
  const response = await axiosInstance.get('/dieteticien-subscriptions/subscribers');
  return response.data;
};

export const getSubscriberStats = async () => {
  const response = await axiosInstance.get('/dieteticien-subscriptions/stats');
  return response.data;
};

export const renewSubscription = async (id, formData) => {
  const response = await axiosInstance.post(`/dieteticien-subscriptions/${id}/renew`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const cancelSubscription = async (id) => {
  const response = await axiosInstance.patch(`/dieteticien-subscriptions/${id}/cancel`);
  return response.data;
};

export const requestZoomSession = async (id, data) => {
  const response = await axiosInstance.post(`/dieteticien-subscriptions/${id}/zoom-request`, data);
  return response.data;
};

export const checkSubscriptionStatus = async (dieteticienId) => {
  const response = await axiosInstance.get(`/dieteticien-subscriptions/check/${dieteticienId}`);
  return response.data;
};
