import api from "./api";

export const getDocuments = async () => {
  const response = await api.get("/documents/");
  return response.data;
};

export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};


export const uploadDocument = async (
  { file, title, sourceType, sourceUrl, description },
  onProgress
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("source_type", sourceType);

  if (sourceUrl) formData.append("source_url", sourceUrl);
  if (description) formData.append("description", description);

  const response = await api.post("/documents/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return response.data;
};


export const reviewDocument = async (documentId, decision) => {
  const response = await api.patch(`/documents/${documentId}/review`, {
    status: decision,
  });
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};