import api from "./client";

export const identityApi = {
  list: (params) => api.get("/admin/identity-verifications", { params }),
  review: (id, payload) => api.put(`/admin/identity-verifications/${id}/review`, payload),
  // payload: { status: 'approved' | 'rejected', rejection_reason? }
};
