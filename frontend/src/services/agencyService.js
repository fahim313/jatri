import api from "./api";

export const getPublicAgencies = async (search = "") => {
  const response = await api.get("/agencies/", {
    params: search ? { search } : {},
  });

  return response.data;
};

export const getPublicAgency = async (agencyId) => {
  const response = await api.get(`/agencies/${agencyId}`);
  return response.data;
};