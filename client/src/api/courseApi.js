import axiosInstance from './axiosInstance';

export const createCourse = async (courseData) => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('level', courseData.level);
  formData.append('semester', courseData.semester);
  if (courseData.url) {
    formData.append('url', courseData.url);
  }
  if (courseData.pdfFiles && courseData.pdfFiles.length > 0) {
    courseData.pdfFiles.forEach((file) => {
      formData.append('pdfFiles', file);
    });
  }

  const response = await axiosInstance.post("/courses", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllCourses = async () => {
  const response = await axiosInstance.get("/courses");
  return response.data;
};

export const getCoursesByLevel = async (level) => {
  const response = await axiosInstance.get(`/courses/level/${level}`);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await axiosInstance.delete(`/courses/${courseId}`);
  return response.data;
};

// Course subscription
export const getPlatformPaymentInfo = async () => {
  const response = await axiosInstance.get("/courses/platform-payment-info");
  return response.data;
};

export const initiateCourseSubscription = async (formData) => {
  const response = await axiosInstance.post("/courses/subscribe", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const checkCourseAccess = async () => {
  const response = await axiosInstance.get("/courses/check-access");
  return response.data;
};

export const getMySubscription = async () => {
  const response = await axiosInstance.get("/courses/my-subscription");
  return response.data;
};

// Admin course subscription management
export const getPendingCourseSubscriptions = async () => {
  const response = await axiosInstance.get("/admin/course-subscriptions/pending");
  return response.data;
};

export const approveCourseSubscription = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/course-subscriptions/approve/${paymentId}`);
  return response.data;
};

export const rejectCourseSubscription = async (paymentId) => {
  const response = await axiosInstance.post(`/admin/course-subscriptions/reject/${paymentId}`);
  return response.data;
};
