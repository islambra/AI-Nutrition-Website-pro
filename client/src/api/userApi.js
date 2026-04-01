import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  const response = await axiosInstance.post("/user/register", userData);
  return response.data;
};


export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/user/login", userData);

  localStorage.setItem("token", response.data.token);

  return response.data;
};


export const getUserData = async () => {
  const response = await axiosInstance.get("/user/data");
  return response.data;
};

