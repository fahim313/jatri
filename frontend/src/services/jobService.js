import api from "./api";

export const getPublicJobs = async (params = {}) => {
  const response = await api.get("/public/jobs/", { params });
  return response.data;
};

export const getPublicJob = async (jobId) => {
  const response = await api.get(`/public/jobs/${jobId}`);
  return response.data;
};

export const getAdminJobs = async (params = {}) => {
  const response = await api.get("/jobs/", { params });
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post("/jobs/", jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.patch(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const publishJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/publish`);
  return response.data;
};

export const unpublishJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/unpublish`);
  return response.data;
};

export const expireJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/expire`);
  return response.data;
};