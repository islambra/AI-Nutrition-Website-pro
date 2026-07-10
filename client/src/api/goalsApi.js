import axiosInstance from './axiosInstance';

export const createGoal = async (data) => {
  const response = await axiosInstance.post('/goals/goals', data);
  return response.data;
};

export const getMyGoals = async () => {
  const response = await axiosInstance.get('/goals/goals');
  return response.data;
};

export const updateGoal = async (id, data) => {
  const response = await axiosInstance.put(`/goals/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await axiosInstance.delete(`/goals/goals/${id}`);
  return response.data;
};

export const getSubscriberGoals = async (clientId) => {
  const response = await axiosInstance.get(`/goals/subscribers/${clientId}/goals`);
  return response.data;
};

export const updateGoalProgress = async (id, data) => {
  const response = await axiosInstance.patch(`/goals/goals/${id}/progress`, data);
  return response.data;
};
