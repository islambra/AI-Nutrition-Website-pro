import axiosInstance from './axiosInstance';

export const getAllFormations = async () => {
  const response = await axiosInstance.get("/formations");
  return response.data;
};

export const getAllFormationsAdmin = async () => {
  const response = await axiosInstance.get("/admin/content/formations");
  return response.data;
};

export const getFormationById = async (id) => {
  const response = await axiosInstance.get(`/formations/${id}`);
  return response.data;
};

const appendFilesToFormData = (formData, files) => {
  const cleaned = files.map((f, i) => {
    if (f.fileObj) {
      formData.append(`file_${i}`, f.fileObj);
      return { name: f.name, type: f.type, url: "", fileId: null };
    }
    return { name: f.name, type: f.type, url: f.url, fileId: f.fileId || null };
  });
  formData.append("files", JSON.stringify(cleaned));
};

export const createFormation = async (data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("price", data.price);
  formData.append("durationWeeks", data.durationWeeks);
  formData.append("startDate", data.startDate);
  if (data.endDate) formData.append("endDate", data.endDate);
  formData.append("sessionsCount", data.sessionsCount || 0);
  if (data.files) appendFilesToFormData(formData, data.files);
  if (data.image) formData.append("image", data.image);
  const response = await axiosInstance.post("/formations", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateFormation = async (id, data) => {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.description !== undefined) formData.append("description", data.description);
  if (data.price !== undefined) formData.append("price", data.price);
  if (data.durationWeeks !== undefined) formData.append("durationWeeks", data.durationWeeks);
  if (data.startDate !== undefined) formData.append("startDate", data.startDate);
  if (data.endDate !== undefined) formData.append("endDate", data.endDate);
  if (data.sessionsCount !== undefined) formData.append("sessionsCount", data.sessionsCount);
  if (data.files) appendFilesToFormData(formData, data.files);
  if (data.image) formData.append("image", data.image);
  const response = await axiosInstance.put(`/formations/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteFormation = async (id) => {
  const response = await axiosInstance.delete(`/formations/${id}`);
  return response.data;
};

export const getMyFormations = async () => {
  const response = await axiosInstance.get("/formations/my-formations");
  return response.data;
};

export const purchaseFormation = async (formationId, paymentMethod = "credit_card") => {
  const response = await axiosInstance.post(`/formations/${formationId}/purchase`, { paymentMethod });
  return response.data;
};

export const getMyPurchasedFormations = async () => {
  const response = await axiosInstance.get("/formations/my-purchased");
  return response.data;
};

export const checkFormationOwnership = async (formationId) => {
  const response = await axiosInstance.get(`/formations/check/${formationId}`);
  return response.data;
};

export const createSession = async (formationId, data) => {
  const response = await axiosInstance.post(`/formations/${formationId}/sessions`, data);
  return response.data;
};

export const getSessions = async (formationId) => {
  const response = await axiosInstance.get(`/formations/${formationId}/sessions`);
  return response.data;
};

export const updateSession = async (sessionId, data) => {
  const response = await axiosInstance.put(`/formations/sessions/${sessionId}`, data);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await axiosInstance.delete(`/formations/sessions/${sessionId}`);
  return response.data;
};
