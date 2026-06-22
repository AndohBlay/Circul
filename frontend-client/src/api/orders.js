import api from "./client";

export const ordersApi = {
  create: (payload) => api.post("/orders", payload),
  list: () => api.get("/orders"),
  show: (id) => api.get(`/orders/${id}`),
  history: () => api.get("/user/orders/history"),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  trackByNumber: (orderNumber) =>
    api.get("/orders/track", { params: { order_number: orderNumber } }),
};
