import api from "./client";

export const adminProductsApi = {
  // Public listing endpoints work fine for admin too (no separate admin GET /products)
  list: (params) => api.get("/products", { params }),
  show: (id) => api.get(`/products/${id}`),
  create: (payload) => api.post("/admin/products", payload),
  update: (id, payload) => api.put(`/admin/products/${id}`, payload),
  remove: (id) => api.delete(`/admin/products/${id}`),
};

export const adminOrdersApi = {
  list: (params) => api.get("/admin/orders", { params }),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
};

export const adminDashboardApi = {
  stats: () => api.get("/admin/dashboard"),
  lowStock: () => api.get("/admin/dashboard/low-stock"),
  overdueInstallments: () => api.get("/admin/dashboard/overdue-installments"),
};
