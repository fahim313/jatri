import api from "./api";

// Public: Get all agencies
export const getPublicAgencies = async (search = "") => {
  const response = await api.get("/agencies/", {
    params: search ? { search } : {},
  });

  return response.data;
};

// Public: Get single agency
export const getPublicAgency = async (agencyId) => {
  const response = await api.get(`/agencies/${agencyId}`);
  return response.data;
};

// Admin: Get all agencies
export const getAdminAgencies = async (search = "") => {
  const response = await api.get("/agencies/", {
    params: search ? { search } : {},
  });

  return response.data;
};

// Admin: Get single agency
export const getAdminAgency = async (agencyId) => {
  const response = await api.get(`/agencies/${agencyId}`);
  return response.data;
};

// Admin: Create agency
export const createAgency = async (agencyData) => {
  const response = await api.post("/agencies/", agencyData);
  return response.data;
};

// Admin: Update agency
export const updateAgency = async (agencyId, agencyData) => {
  const response = await api.patch(
    `/agencies/${agencyId}`,
    agencyData
  );

  return response.data;
};

// Admin: Delete agency
export const deleteAgency = async (agencyId) => {
  const response = await api.delete(`/agencies/${agencyId}`);
  return response.data;
};