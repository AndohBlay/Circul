import api from "./client";

export const paymentsApi = {
  initializeFull: (payload) => api.post("/payments/initialize", payload),
  verifyFull: (payload) => api.post("/payments/verify", payload),
};

export const installmentsApi = {
  createPlan: (payload) => api.post("/installments/plan", payload),
  myPlans: () => api.get("/installments"),
  show: (planId) => api.get(`/installments/${planId}`),
  initializeSchedulePayment: (scheduleId) =>
    api.post(`/installments/schedule/${scheduleId}/pay`),
  verifySchedulePayment: (payload) => api.post("/installments/verify", payload),
};
