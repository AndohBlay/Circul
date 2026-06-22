import api from "./client";

export const superAdminApi = {
  updateProfile: (payload) => api.put("/superadmin/profile", payload),

  listAdmins: () => api.get("/superadmin/admins"),
  createAdmin: (payload) => api.post("/superadmin/admins", payload),
  adminPerformanceStats: () => api.get("/superadmin/admins/performance"),
  updateAdmin: (id, payload) => api.put(`/superadmin/admins/${id}`, payload),
  resetAdminPassword: (id, password) =>
    api.post(`/superadmin/admins/${id}/reset-password`, { password }),
  deactivateAdmin: (id) => api.delete(`/superadmin/admins/${id}/deactivate`),
  reactivateAdmin: (id) => api.post(`/superadmin/admins/${id}/reactivate`),
  monitorAdminActivity: (id) => api.get(`/superadmin/admins/${id}/activity`),

  listClients: (params) => api.get("/superadmin/clients", { params }),
  stats: () => api.get("/superadmin/stats"),
};
