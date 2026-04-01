import axiosInstance from './axiosInstance';

export const submitContact = async (contactData) => {
  const response = await axiosInstance.post("/contact", contactData);
  return response.data;
};

export const getAllContacts = async () => {
  const response = await axiosInstance.get("/contacts");
  return response.data;
};


export const deleteContact = async (id) => {
  const response = await axiosInstance.delete(`/contact/${id}`);
  return response.data;
};