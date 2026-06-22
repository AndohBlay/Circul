import api from "./client";

export const categoriesApi = {
  list: () => api.get("/categories"),
};
