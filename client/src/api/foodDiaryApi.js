import axiosInstance from './axiosInstance';

export const createEntry = async (data) => {
  const response = await axiosInstance.post('/food-diary/entries', data);
  return response.data;
};

export const getMyEntries = async (params = {}) => {
  const response = await axiosInstance.get('/food-diary/entries', { params });
  return response.data;
};

export const deleteEntry = async (id) => {
  const response = await axiosInstance.delete(`/food-diary/entries/${id}`);
  return response.data;
};

export const getSubscriberEntries = async (clientId, params = {}) => {
  const response = await axiosInstance.get(`/food-diary/subscribers/${clientId}/entries`, { params });
  return response.data;
};

export const addFeedback = async (entryId, feedback) => {
  const response = await axiosInstance.patch(`/food-diary/entries/${entryId}/feedback`, { feedback });
  return response.data;
};
