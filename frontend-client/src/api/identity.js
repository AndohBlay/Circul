import api from "./client";

export const identityApi = {
  status: () => api.get("/identity/status"),

  submit: (formData) =>
    api.post("/identity/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  // formData fields: id_type, id_number, id_front_image, id_back_image?, selfie_image
};
