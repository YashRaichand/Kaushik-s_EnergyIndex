import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach JWT ──────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("edi_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("edi_token");
        localStorage.removeItem("edi_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register:      (data: any) => api.post("/auth/register", data),
  login:         (data: any) => api.post("/auth/login", data),
  googleLogin:   (code: string) => api.post("/auth/google", { code }),
  me:            () => api.get("/auth/me"),
};

// ── Villages ──────────────────────────────────────────────────
export const villagesAPI = {
  list:    (params?: any) => api.get("/villages/", { params }),
  get:     (id: number)   => api.get(`/villages/${id}`),
  create:  (data: any)    => api.post("/villages/", data),
  update:  (id: number, data: any) => api.put(`/villages/${id}`, data),
  delete:  (id: number)   => api.delete(`/villages/${id}`),
  states:  ()             => api.get("/villages/states"),
};

// ── Predictions ───────────────────────────────────────────────
export const predictionsAPI = {
  simulate: (data: any) => api.post("/predictions/simulate", data),
  history:  (params?: any) => api.get("/predictions/history", { params }),
  get:      (id: number)   => api.get(`/predictions/${id}`),
};

// ── Reports ───────────────────────────────────────────────────
export const reportsAPI = {
  generate: (data: any) => api.post("/reports/generate", data),
  list:     ()          => api.get("/reports/"),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  dashboard:     () => api.get("/analytics/dashboard"),
  edsTrend:      () => api.get("/analytics/eds-trend"),
  stateRankings: () => api.get("/analytics/state-rankings"),
  usersByRole:   () => api.get("/analytics/users-by-role"),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  users:        ()          => api.get("/admin/users"),
  changeRole:   (id: number, role: string) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
  stats:        ()          => api.get("/admin/stats"),
  auditLogs:    (params?: any) => api.get("/admin/audit-logs", { params }),
  modelStatus:  ()          => api.get("/admin/models/status"),
};
