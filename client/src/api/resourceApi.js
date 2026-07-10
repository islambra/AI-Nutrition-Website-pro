import axiosInstance from './axiosInstance';

export const createResource = async (formData) => {
  const response = await axiosInstance.post('/resources/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyResources = async () => {
  const response = await axiosInstance.get('/resources/resources');
  return response.data;
};

export const getSubscriberResources = async (dieteticienId) => {
  const response = await axiosInstance.get(`/resources/resources/${dieteticienId}`);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/resources/${id}`);
  return response.data;
};
