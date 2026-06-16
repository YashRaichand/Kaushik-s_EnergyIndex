import axios from "axios";

// Get API URL - fallback to backend URL directly
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kaushik-s-energyindex.onrender.com/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("edi_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Helper function for direct fetch (more reliable on mobile)
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("edi_token") : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw { response: { data, status: res.status } };
  return data;
};

export const authAPI = {
  register: (data: any) => apiFetch("/auth/register", { method:"POST", body: JSON.stringify(data) }),
  login:    (data: any) => apiFetch("/auth/login",    { method:"POST", body: JSON.stringify(data) }),
  me:       ()          => apiFetch("/auth/me"),
};

export const villagesAPI = {
  list:   (params?: any) => api.get("/villages/", { params }),
  get:    (id: number)   => api.get(`/villages/${id}`),
  create: (data: any)    => api.post("/villages/", data),
  update: (id: number, data: any) => api.put(`/villages/${id}`, data),
  delete: (id: number)   => api.delete(`/villages/${id}`),
  states: ()             => api.get("/villages/states"),
};

export const predictionsAPI = {
  simulate: (data: any) => api.post("/predictions/simulate", data).then(r => r.data),
  history:  ()          => api.get("/predictions/history").then(r => r.data),
};

export const reportsAPI = {
  generate: (data: any) => api.post("/reports/generate", data),
  list:     ()          => api.get("/reports/"),
};

export const analyticsAPI = {
  dashboard:     () => api.get("/analytics/dashboard"),
  edsTrend:      () => api.get("/analytics/eds-trend"),
  stateRankings: () => api.get("/analytics/state-rankings"),
};

export const adminAPI = {
  users:       () => api.get("/admin/users"),
  stats:       () => api.get("/admin/stats"),
  modelStatus: () => api.get("/admin/models/status"),
};
