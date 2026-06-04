// src/api/consultationApi.js
import axiosInstance from './axiosInstance';

export const bookConsultation = async (userPlanId, requestedDateTime, note) => {
  const res = await axiosInstance.post("/consultations/book", { userPlanId, requestedDateTime, note });
  return res.data;
};

export const getUserConsultations = async () => {
  const res = await axiosInstance.get("/consultations/my-bookings");
  return res.data;
};

export const getMyConsultations = async () => {
  const res = await axiosInstance.get("/consultations/my-bookings");
  return res.data;
};

export const getConsultationsByUserPlan = async (userPlanId) => {
  const res = await axiosInstance.get(`/consultations/user-plan/${userPlanId}`);
  return res.data;
};

export const getDieteticienRequests = async () => {
  const res = await axiosInstance.get("/consultations/nutritionist-requests");
  return res.data;
};
export const getNutritionistRequests = getDieteticienRequests;

export const acceptConsultation = async (consultationId) => {
  const res = await axiosInstance.patch(`/consultations/${consultationId}/accept`);
  return res.data;
};

export const rejectConsultation = async (consultationId) => {
  const res = await axiosInstance.patch(`/consultations/${consultationId}/reject`);
  return res.data;
};

export const completeConsultation = async (consultationId) => {
  const res = await axiosInstance.patch(`/consultations/${consultationId}/complete`);
  return res.data;
};

export const cancelConsultation = async (consultationId) => {
  const res = await axiosInstance.patch(`/consultations/${consultationId}/cancel`);
  return res.data;
};

export const deleteConsultation = async (consultationId) => {
  const res = await axiosInstance.delete(`/consultations/${consultationId}`);
  return res.data;
};