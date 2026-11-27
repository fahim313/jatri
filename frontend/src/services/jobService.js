import api from "./api";

export const getPublicJobs = async (params = {}) => {
  const response = await api.get("/public/jobs/", { params });
  return response.data;
};

export const getPublicJob = async (jobId) => {
  const response = await api.get(`/public/jobs/${jobId}`);
  return response.data;
};