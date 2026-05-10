import axiosInstance from './axiosInstance';

export const checkAiAccess = async () => {
  const res = await axiosInstance.get("/ai/check-access");
  return res.data;
};

export const buyAiAccess = async (paymentMethod = "credit_card") => {
  const res = await axiosInstance.post("/ai/buy-access", { paymentMethod });
  return res.data;
};