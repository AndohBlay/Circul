import api from "./client";

export const authApi = {
  login: (payload) => api.post("/login", payload),
  // payload: { login, password }

  logout: () => api.post("/logout"),

  me: () => api.get("/me"),

  changePassword: (payload) => api.put("/user/change-password", payload),
};
