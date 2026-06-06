import axiosInstance from './axiosInstance';

export const getRooms = async () => {
  const response = await axiosInstance.get('/chat/rooms');
  return response.data;
};

export const getMessages = async (roomId, page = 1, limit = 50) => {
  const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  return response.data;
};

export const createRoom = async ({ type, plan, formation, otherUserId, otherUserRole }) => {
  const response = await axiosInstance.post('/chat/rooms', { type, plan, formation, otherUserId, otherUserRole });
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await axiosInstance.delete(`/chat/rooms/${roomId}`);
  return response.data;
};
