import api from "./client";

export const authApi = {
  register: (payload) => api.post("/register", payload),
  // payload: { name, email, password, password_confirmation, phone }

  login: (payload) => api.post("/login", payload),
  // payload: { login, password } — login can be email or phone

  verifyOtp: (payload) => api.post("/verify-otp", payload),
  // payload: { user_id, otp }

  resendOtp: (payload) => api.post("/resend-otp", payload),
  // payload: { user_id }

  forgotPassword: (payload) => api.post("/forgot-password", payload),
  // payload: { phone }

  resetPassword: (payload) => api.post("/reset-password", payload),
  // payload: { user_id, otp, password, password_confirmation }

  logout: () => api.post("/logout"),

  me: () => api.get("/me"),

  changePassword: (payload) => api.put("/user/change-password", payload),
};
