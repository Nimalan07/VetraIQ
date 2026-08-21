import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

export const uploadProduct = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/ingest/pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const processProduct = async (
  filename: string
) => {
  const response = await api.post(
    `/api/process/pdf?filename=${encodeURIComponent(filename)}`
  );

  return response.data;
};

export const generateCatalogSheet = async (
  filename: string
) => {
  const response = await api.post(
    `/api/process/catalog-sheet?filename=${encodeURIComponent(filename)}`
  );

  return response.data;
};

export const processBulkCsv = async (
  file: File,
  limit: number = 10
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/process/bulk-csv?limit=${limit}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    }
  );

  return response.data;
};


export const evaluateSubmission = async (
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/process/evaluate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


