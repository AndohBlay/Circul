import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Laravel serves uploaded files (storage:link'd) from the app root, not /api —
// derive that root so we can build image URLs like `${storageURL}/storage/identities/front/xyz.jpg`
export const storageURL = baseURL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("circul_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("circul_admin_token");
      localStorage.removeItem("circul_admin_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
