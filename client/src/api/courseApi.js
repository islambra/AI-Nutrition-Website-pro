import axiosInstance from './axiosInstance';

export const createCourse = async (courseData) => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('level', courseData.level);
  formData.append('semester', courseData.semester);
  if (courseData.url) {
    formData.append('url', courseData.url);
  }
  if (courseData.pdfFile) {
    formData.append('pdfFile', courseData.pdfFile);
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
