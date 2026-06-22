import api from "./client";

export const productsApi = {
  list: (params) => api.get("/products", { params }),
  show: (id) => api.get(`/products/${id}`),
};
