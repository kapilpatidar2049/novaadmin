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

export function setUser(user: { id: string; name: string; email: string; role?: string }) {
  localStorage.setItem("admin_user", JSON.stringify(user));
}

export function getUser(): { id: string; name: string; email: string; role?: string } | null {
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
      if (json.data.user) {
        const u = json.data.user as { id: string; name: string; email: string; role?: string };
        setUser({ id: u.id, name: u.name, email: u.email, role: u.role });
      }
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
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
}

export interface ApiVendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city: ApiCity | string;
  address?: string;
  isActive?: boolean;
  platformCommissionPercent?: number;
}

export interface ApiBanner {
  _id: string;
  title: string;
  imageUrl: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

export interface ApiCategory {
  _id: string;
  name: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ApiService {
  _id: string;
  name: string;
  category?: ApiCategory | string | null;
  description?: string;
  includes?: string[];
  experts?: string[];
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
  platformCommissionPercent: number;
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
  kycStatus?: "pending" | "approved" | "rejected";
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    status: "pending" | "approved" | "rejected";
    notes: string;
  }>;
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

export interface ApiPayment {
  id: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentType?: "appointment" | "wallet_recharge";
  customerName: string;
  beauticianName: string;
  vendorName: string;
  providerOrderId: string;
  providerPaymentId: string;
  createdAt: string;
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

export interface ApiReferralSettings {
  isEnabled: boolean;
  customerRewardAmount: number;
  beauticianRewardAmount: number;
  updatedAt?: string;
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

export interface ApiAppointmentSummary {
  id: string;
  status: string;
  price: number;
  scheduledAt: string;
  createdAt: string;
  address?: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
  };
  beautician: {
    id: string;
    name: string;
    phone: string;
  } | null;
  service: {
    id?: string;
    name: string;
  };
  distanceInKm?: number | null;
}

export interface ApiAppointmentDetail extends ApiAppointmentSummary {
  notes?: string;
  customer: ApiAppointmentSummary["customer"] & { email?: string };
  beautician: (ApiAppointmentSummary["beautician"] & { email?: string }) | null;
}

export const adminApi = {
  getReferralSettings: () => request<ApiReferralSettings>("/admin/referral-settings"),
  updateReferralSettings: (body: {
    isEnabled?: boolean;
    customerRewardAmount?: number;
    beauticianRewardAmount?: number;
  }) =>
    request<ApiReferralSettings>("/admin/referral-settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getDashboard: () => request<DashboardData>("/admin/dashboard"),
  getCities: (page = 1, limit = 50, search = "") =>
    request<{ items: ApiCity[]; meta: { page: number; limit: number; total: number } }>("/admin/cities", {
      params: { page: String(page), limit: String(limit), search },
    }),
  createCity: (body: {
    name: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
  }) => request<ApiCity>("/admin/cities", { method: "POST", body: JSON.stringify(body) }),
  updateCity: (id: string, body: { name?: string; state?: string; country?: string; isActive?: boolean; latitude?: number; longitude?: number; googlePlaceId?: string }) =>
    request<ApiCity>(`/admin/cities/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCity: (id: string) =>
    request(`/admin/cities/${id}`, { method: "DELETE" }),
  getVendors: (page = 1, limit = 50, search = "", cityId = "") =>
    request<{ items: ApiVendor[]; meta: { page: number; limit: number; total: number } }>("/admin/vendors", {
      params: { page: String(page), limit: String(limit), search, cityId },
    }),
  createVendor: (body: {
    name: string;
    email: string;
    phone?: string;
    city: string;
    address?: string;
    platformCommissionPercent?: number;
    panelPassword?: string;
  }) => request<ApiVendor>("/admin/vendors", { method: "POST", body: JSON.stringify(body) }),
  updateVendor: (id: string, body: { name?: string; email?: string; phone?: string; address?: string; isActive?: boolean; city?: string; platformCommissionPercent?: number; panelPassword?: string }) =>
    request<ApiVendor>(`/admin/vendors/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteVendor: (id: string) =>
    request(`/admin/vendors/${id}`, { method: "DELETE" }),
  getBanners: (page = 1, limit = 100) =>
    request<{ items: ApiBanner[]; meta: { page: number; limit: number; total: number } }>("/admin/banners", {
      params: { page: String(page), limit: String(limit) },
    }),
  createBanner: (body: { title: string; link?: string; order?: number; isActive?: boolean; imageFile?: File | null }) => {
    const form = new FormData();
    form.append("title", body.title);
    if (body.link != null) form.append("link", body.link);
    if (body.order != null) form.append("order", String(body.order));
    if (body.isActive != null) form.append("isActive", String(body.isActive));
    if (body.imageFile) form.append("image", body.imageFile);
    return request<ApiBanner>("/admin/banners", { method: "POST", body: form });
  },
  updateBanner: (id: string, body: { title?: string; link?: string; order?: number; isActive?: boolean; imageFile?: File | null }) => {
    if (body.imageFile) {
      const form = new FormData();
      if (body.title !== undefined) form.append("title", body.title);
      if (body.link !== undefined) form.append("link", body.link ?? "");
      if (body.order !== undefined) form.append("order", String(body.order));
      if (body.isActive !== undefined) form.append("isActive", String(body.isActive));
      form.append("image", body.imageFile);
      return request<ApiBanner>(`/admin/banners/${id}`, { method: "PUT", body: form });
    }
    const { imageFile: _, ...rest } = body;
    return request<ApiBanner>(`/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  },
  deleteBanner: (id: string) =>
    request(`/admin/banners/${id}`, { method: "DELETE" }),
  getCategories: (page = 1, limit = 100, search = "") =>
    request<{ items: ApiCategory[]; meta: { page: number; limit: number; total: number } }>("/admin/categories", {
      params: { page: String(page), limit: String(limit), search },
    }),
  createCategory: (body: { name: string; order?: number; isActive?: boolean; imageFile?: File | null }) => {
    const form = new FormData();
    form.append("name", body.name);
    if (body.order != null) form.append("order", String(body.order));
    if (body.isActive != null) form.append("isActive", String(body.isActive));
    if (body.imageFile) form.append("image", body.imageFile);
    return request<ApiCategory>("/admin/categories", { method: "POST", body: form });
  },
  updateCategory: (id: string, body: { name?: string; order?: number; isActive?: boolean; imageFile?: File | null }) => {
    if (body.imageFile) {
      const form = new FormData();
      if (body.name !== undefined) form.append("name", body.name);
      if (body.order !== undefined) form.append("order", String(body.order));
      if (body.isActive !== undefined) form.append("isActive", String(body.isActive));
      form.append("image", body.imageFile);
      return request<ApiCategory>(`/admin/categories/${id}`, { method: "PUT", body: form });
    }
    const { imageFile: _, ...rest } = body;
    return request<ApiCategory>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  },
  deleteCategory: (id: string) =>
    request(`/admin/categories/${id}`, { method: "DELETE" }),
  getServices: (page = 1, limit = 50, search = "") =>
    request<{ items: ApiService[]; meta: { page: number; limit: number; total: number } }>("/admin/services", {
      params: { page: String(page), limit: String(limit), search },
    }),
  createService: (body: { name: string; category?: string; description?: string; includes?: string[]; experts?: string[]; basePrice: number; durationMinutes: number; imageFile?: File | null; imageUrl?: string }) => {
    const form = new FormData();
    form.append("name", body.name);
    form.append("basePrice", String(body.basePrice));
    form.append("durationMinutes", String(body.durationMinutes));
    if (body.category) form.append("category", body.category);
    if (body.description) form.append("description", body.description);
    if (body.includes && body.includes.length) form.append("includes", JSON.stringify(body.includes));
    if (body.experts && body.experts.length) form.append("experts", JSON.stringify(body.experts));
    if (body.imageUrl && !body.imageFile) form.append("imageUrl", body.imageUrl);
    if (body.imageFile) form.append("image", body.imageFile);
    return request<ApiService>("/admin/services", { method: "POST", body: form });
  },
  updateService: (id: string, body: { name?: string; category?: string; description?: string; includes?: string[]; experts?: string[]; imageUrl?: string; basePrice?: number; durationMinutes?: number; isActive?: boolean; imageFile?: File | null }) => {
    if (body.imageFile) {
      const form = new FormData();
      if (body.name !== undefined) form.append("name", body.name);
      if (body.category !== undefined) form.append("category", body.category);
      if (body.description !== undefined) form.append("description", body.description);
      if (body.includes !== undefined) form.append("includes", JSON.stringify(body.includes));
      if (body.experts !== undefined) form.append("experts", JSON.stringify(body.experts));
      if (body.imageUrl !== undefined) form.append("imageUrl", body.imageUrl);
      if (body.basePrice !== undefined) form.append("basePrice", String(body.basePrice));
      if (body.durationMinutes !== undefined) form.append("durationMinutes", String(body.durationMinutes));
      if (body.isActive !== undefined) form.append("isActive", String(body.isActive));
      form.append("image", body.imageFile);
      return request<ApiService>(`/admin/services/${id}`, { method: "PUT", body: form });
    }
    const { imageFile: _, ...rest } = body;
    return request<ApiService>(`/admin/services/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  },
  deleteService: (id: string) =>
    request(`/admin/services/${id}`, { method: "DELETE" }),
  getBeauticians: (page = 1, limit = 100, search = "", cityId = "") =>
    request<{ items: ApiBeautician[]; meta: { page: number; limit: number; total: number } }>("/admin/beauticians", {
      params: { page: String(page), limit: String(limit), search, cityId },
    }),
  getBeauticianById: (id: string) =>
    request<ApiBeauticianDetail>(`/admin/beauticians/${id}`),
  updateBeautician: (id: string, body: { name?: string; phone?: string; password?: string; rating?: number; walletBalance?: number; isActive?: boolean; expertise?: string[]; experienceYears?: number; isAvailable?: boolean; cityId?: string; vendorId?: string; kycStatus?: "pending" | "approved" | "rejected"; platformCommissionPercent?: number; documents?: Array<{ id: string; status?: "pending" | "approved" | "rejected"; notes?: string }> }) =>
    request<ApiBeauticianDetail>(`/admin/beauticians/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  getBeauticianLiveLocation: (id: string) =>
    request<LiveBeautician | null>(`/admin/beauticians/${id}/live-location`),
  createBeautician: (body: { name: string; email: string; password?: string; phone?: string; vendorId: string; cityId?: string; platformCommissionPercent?: number }) =>
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
  getPayments: (page = 1, limit = 50, status = "") =>
    request<{ items: ApiPayment[]; meta: { page: number; limit: number; total: number } }>("/admin/payments", {
      params: { page: String(page), limit: String(limit), status },
    }),
  getReports: (
    from?: string,
    to?: string,
    scope?: { beauticianId?: string; vendorId?: string },
  ) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (scope?.beauticianId) params.beauticianId = scope.beauticianId;
    if (scope?.vendorId) params.vendorId = scope.vendorId;
    return request<{ payments: unknown[] }>("/admin/reports", { params });
  },
  getAppointments: (page = 1, limit = 50, status = "", customerId = "", beauticianId = "") =>
    request<{ items: ApiAppointmentSummary[]; meta: { page: number; limit: number; total: number } }>("/admin/appointments", {
      params: {
        page: String(page),
        limit: String(limit),
        status,
        customerId,
        beauticianId,
      },
    }),
  getAppointmentById: (id: string) =>
    request<ApiAppointmentDetail>("/admin/appointments/" + id),
  updateAppointment: (id: string, body: { beautician?: string | null }) =>
    request<ApiAppointmentDetail>(`/admin/appointments/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  getInventory: (page = 1, limit = 50, search = "", vendorId = "") =>
    request<{
      items: Array<{
        _id: string;
        name: string;
        sku?: string;
        quantity: number;
        unit?: string;
        costPrice?: number;
        sellingPrice?: number;
        isActive?: boolean;
        showInShop?: boolean;
        imageUrl?: string;
        description?: string;
        vendor?: { _id: string; name?: string };
      }>;
      meta: { page: number; limit: number; total: number };
    }>("/admin/inventory", {
      params: {
        page: String(page),
        limit: String(limit),
        search,
        ...(vendorId ? { vendorId } : {}),
      },
    }),
  createInventoryItem: (
    body: {
      vendorId?: string;
      name: string;
      sku?: string;
      quantity?: number;
      unit?: string;
      costPrice?: number;
      sellingPrice?: number;
      isActive?: boolean;
      showInShop?: boolean;
      description?: string;
    },
    imageFile?: File | null,
  ) => {
    const form = new FormData();
    form.append("name", body.name);
    if (body.vendorId) form.append("vendorId", body.vendorId);
    form.append("sku", body.sku ?? "");
    form.append("quantity", String(body.quantity ?? 0));
    form.append("unit", body.unit ?? "");
    form.append("costPrice", body.costPrice != null ? String(body.costPrice) : "");
    form.append("sellingPrice", body.sellingPrice != null ? String(body.sellingPrice) : "");
    form.append("isActive", String(body.isActive !== false));
    form.append("showInShop", String(body.showInShop !== false));
    form.append("description", body.description ?? "");
    if (imageFile) form.append("image", imageFile);
    return request<{ _id: string }>("/admin/inventory", { method: "POST", body: form });
  },
  updateInventoryItem: (
    id: string,
    body: {
      name: string;
      sku?: string;
      quantity?: number;
      unit?: string;
      costPrice?: number;
      sellingPrice?: number;
      isActive?: boolean;
      showInShop?: boolean;
      description?: string;
      /** Remove stored image without uploading a new file */
      clearImage?: boolean;
    },
    imageFile?: File | null,
  ) => {
    const form = new FormData();
    form.append("name", body.name);
    form.append("sku", body.sku ?? "");
    form.append("quantity", String(body.quantity ?? 0));
    form.append("unit", body.unit ?? "");
    form.append("costPrice", body.costPrice != null ? String(body.costPrice) : "");
    form.append("sellingPrice", body.sellingPrice != null ? String(body.sellingPrice) : "");
    form.append("isActive", String(body.isActive !== false));
    form.append("showInShop", String(body.showInShop !== false));
    form.append("description", body.description ?? "");
    if (imageFile) form.append("image", imageFile);
    if (body.clearImage && !imageFile) form.append("clearImage", "true");
    return request<{ _id: string }>(`/admin/inventory/${id}`, { method: "PUT", body: form });
  },
  deleteInventoryItem: (id: string) => request(`/admin/inventory/${id}`, { method: "DELETE" }),
  getProductOrders: (page = 1, limit = 50, vendorId = "", status = "") =>
    request<{
      items: Array<{
        _id: string;
        customer?: { name?: string; email?: string; phone?: string };
        vendor?: { name?: string };
        totalAmount: number;
        status: string;
        paymentMode?: string;
        address?: string;
        createdAt?: string;
      }>;
      meta: { page: number; limit: number; total: number };
    }>("/admin/product-orders", {
      params: {
        page: String(page),
        limit: String(limit),
        ...(vendorId ? { vendorId } : {}),
        ...(status ? { status } : {}),
      },
    }),
  updateProductOrderStatus: (id: string, status: string) =>
    request(`/admin/product-orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
