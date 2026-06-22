import axios from "axios";

// Laravel serves the API at /api — point this at wherever the backend runs.
// Set VITE_API_URL in a .env file to override (e.g. for production: https://api.circul.app/api)
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Laravel serves uploaded files (storage:link'd) from the app root, not /api
export const storageURL = baseURL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

// Attach the bearer token (Sanctum personal access token) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("circul_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, the token is dead — clear it and bounce to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("circul_token");
      localStorage.removeItem("circul_user");
      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
