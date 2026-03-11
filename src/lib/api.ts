const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("admin_refresh_token");
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("admin_token", accessToken);
  localStorage.setItem("admin_refresh_token", refreshToken);
}

export function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
}

export function setUser(user: { id: string; name: string; email: string }) {
  localStorage.setItem("admin_user", JSON.stringify(user));
}

export function getUser(): { id: string; name: string; email: string } | null {
  const s = localStorage.getItem("admin_user");
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const { params, ...init } = options;
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { ...init, headers });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshToken();
    if (refreshed) return request<T>(path, options);
  }

  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

async function refreshToken(): Promise<boolean> {
  const ref = getRefreshToken();
  if (!ref) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: ref }),
    });
    const json = await res.json();
    if (json.success && json.data?.tokens) {
      setAuthTokens(json.data.tokens.accessToken, json.data.tokens.refreshToken);
      if (json.data.user) setUser(json.data.user);
      return true;
    }
  } catch {
    // ignore
  }
  clearAuth();
  return false;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{
      user: { id: string; name: string; email: string; role: string };
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
};

export interface ApiCity {
  _id: string;
  name: string;
  state?: string;
  country?: string;
  isActive?: boolean;
}

export interface ApiVendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city: ApiCity | string;
  address?: string;
  isActive?: boolean;
}

export interface ApiService {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface ApiBeautician {
  _id: string;
  id: string;
  name: string;
  phone: string;
  city: string;
  vendor: string;
  vendorId: string;
  services: number;
  rating: number;
  status: "online" | "busy" | "offline";
  completedToday: number;
}

export interface ApiBeauticianDetail {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cityId?: string;
  vendor: string;
  vendorId: string;
  totalJobs: number;
  totalEarnings: number;
  walletBalance: number;
  rating: number;
  expertise?: string[];
  experienceYears: number;
  isAvailable: boolean;
  inProgressCount: number;
  completedToday: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  isActive: boolean;
  totalBookings?: number;
  totalJobs?: number;
  totalSpent?: number;
  rating?: number;
  walletBalance?: number;
  createdAt: string;
}

export interface ApiUserDetail extends ApiUser {
  totalBookings?: number;
  totalSpent?: number;
  updatedAt: string;
}

export interface ApiAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  city?: string;
  time: string;
  read?: boolean;
}

export interface LiveBeautician {
  id: string;
  name: string;
  status: "online" | "busy" | "offline";
  city: string;
  lat: number;
  lng: number;
}

export interface TopVendor {
  id: string;
  name: string;
  city: string;
  revenue: number;
  beauticians: number;
  growth: number;
  avatar: string;
}

export interface DashboardData {
  totalCities: number;
  totalVendors: number;
  totalServices: number;
  totalAppointments: number;
  totalPaidPayments: number;
  liveBeauticians?: LiveBeautician[];
  recentAlerts?: ApiAlert[];
  topVendors?: TopVendor[];
}

export const adminApi = {
  getDashboard: () => request<DashboardData>("/admin/dashboard"),
  getCities: (page = 1, limit = 50, search = "") =>
    request<{ items: ApiCity[]; meta: { page: number; limit: number; total: number } }>("/admin/cities", {
      params: { page: String(page), limit: String(limit), search },
    }),
  createCity: (body: { name: string; state?: string; country?: string }) =>
    request<ApiCity>("/admin/cities", { method: "POST", body: JSON.stringify(body) }),
  updateCity: (id: string, body: { name?: string; state?: string; country?: string; isActive?: boolean }) =>
    request<ApiCity>(`/admin/cities/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCity: (id: string) =>
    request(`/admin/cities/${id}`, { method: "DELETE" }),
  getVendors: (page = 1, limit = 50, search = "", cityId = "") =>
    request<{ items: ApiVendor[]; meta: { page: number; limit: number; total: number } }>("/admin/vendors", {
      params: { page: String(page), limit: String(limit), search, cityId },
    }),
  createVendor: (body: { name: string; email: string; phone?: string; city: string; address?: string }) =>
    request<ApiVendor>("/admin/vendors", { method: "POST", body: JSON.stringify(body) }),
  updateVendor: (id: string, body: { name?: string; phone?: string; address?: string; isActive?: boolean }) =>
    request<ApiVendor>(`/admin/vendors/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteVendor: (id: string) =>
    request(`/admin/vendors/${id}`, { method: "DELETE" }),
  getServices: (page = 1, limit = 50, search = "") =>
    request<{ items: ApiService[]; meta: { page: number; limit: number; total: number } }>("/admin/services", {
      params: { page: String(page), limit: String(limit), search },
    }),
  createService: (body: { name: string; category?: string; description?: string; basePrice: number; durationMinutes: number; imageFile?: File | null; imageUrl?: string }) => {
    const form = new FormData();
    form.append("name", body.name);
    form.append("basePrice", String(body.basePrice));
    form.append("durationMinutes", String(body.durationMinutes));
    if (body.category) form.append("category", body.category);
    if (body.description) form.append("description", body.description);
    if (body.imageUrl) form.append("imageUrl", body.imageUrl);
    if (body.imageFile) form.append("image", body.imageFile);
    return request<ApiService>("/admin/services", { method: "POST", body: form });
  },
  updateService: (id: string, body: { name?: string; category?: string; description?: string; imageUrl?: string; basePrice?: number; durationMinutes?: number; isActive?: boolean }) =>
    request<ApiService>(`/admin/services/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteService: (id: string) =>
    request(`/admin/services/${id}`, { method: "DELETE" }),
  getBeauticians: (page = 1, limit = 100, search = "", cityId = "") =>
    request<{ items: ApiBeautician[]; meta: { page: number; limit: number; total: number } }>("/admin/beauticians", {
      params: { page: String(page), limit: String(limit), search, cityId },
    }),
  getBeauticianById: (id: string) =>
    request<ApiBeauticianDetail>(`/admin/beauticians/${id}`),
  updateBeautician: (id: string, body: { name?: string; phone?: string; password?: string; rating?: number; walletBalance?: number; isActive?: boolean; expertise?: string[]; experienceYears?: number; isAvailable?: boolean }) =>
    request<ApiBeauticianDetail>(`/admin/beauticians/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  createBeautician: (body: { name: string; email: string; password?: string; phone?: string; vendorId: string; cityId?: string }) =>
    request<ApiBeautician>("/admin/beauticians", { method: "POST", body: JSON.stringify(body) }),
  getUsers: (page = 1, limit = 50, search = "", role = "") =>
    request<{ items: ApiUser[]; meta: { page: number; limit: number; total: number } }>("/admin/users", {
      params: { page: String(page), limit: String(limit), search, ...(role ? { role } : {}) },
    }),
  getUserById: (id: string) =>
    request<ApiUserDetail | ApiBeauticianDetail>(`/admin/users/${id}`),
  updateUser: (id: string, body: { name?: string; phone?: string; password?: string; isActive?: boolean }) =>
    request<ApiUserDetail | ApiBeauticianDetail>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  getAlerts: () => request<ApiAlert[]>("/admin/alerts"),
  getReports: (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return request<{ payments: unknown[] }>("/admin/reports", { params });
  },
};
