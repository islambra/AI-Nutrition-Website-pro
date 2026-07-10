import axiosInstance from './axiosInstance';

export const createProgressEntry = async (data) => {
  const response = await axiosInstance.post('/progress/entries', data);
  return response.data;
};

export const getMyProgress = async (params = {}) => {
  const response = await axiosInstance.get('/progress/entries', { params });
  return response.data;
};

export const deleteProgressEntry = async (id) => {
  const response = await axiosInstance.delete(`/progress/entries/${id}`);
  return response.data;
};

export const getSubscriberProgress = async (clientId, params = {}) => {
  const response = await axiosInstance.get(`/progress/subscribers/${clientId}/entries`, { params });
  return response.data;
};
