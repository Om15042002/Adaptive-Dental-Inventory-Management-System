import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post("/products", product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  bulkCreate: (products) => api.post("/products/bulk", { products }),
  search: (params) => api.get("/products/search", { params }),
  getLowStock: () => api.get("/products/low-stock"),
  getStats: () => api.get("/products/stats"),
  getInventoryValue: () => api.get("/products/inventory-value"),
  getByFrequency: (frequency) => api.get(`/products/frequency/${frequency}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params) => api.get("/inventory", { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  updateStock: (id, stockData) => api.put(`/inventory/${id}/stock`, stockData),
  getLowStock: () => api.get("/inventory/low-stock"),
  getLowStockSummary: () => api.get("/inventory/low-stock-summary"),
  getValue: () => api.get("/inventory/value"),
  getDashboardStats: () => api.get("/inventory/dashboard"),
  getByFrequency: (frequency) => api.get(`/inventory/by-frequency/${frequency}`),
  adjustStock: (id, adjustmentData) => api.put(`/inventory/${id}/adjust`, adjustmentData),
  getHistory: (id) => api.get(`/inventory/${id}/history`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post("/categories", category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get("/suppliers"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplier) => api.post("/suppliers", supplier),
  update: (id, supplier) => api.put(`/suppliers/${id}`, supplier),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Stock Movements API
export const stockMovementsAPI = {
  getAll: (params) => api.get("/stock-movements", { params }),
  create: (movement) => api.post("/stock-movements", movement),
  getById: (id) => api.get(`/stock-movements/${id}`),
  getByProduct: (productId, params) => api.get(`/stock-movements/product/${productId}`, { params }),
  getRecent: () => api.get("/stock-movements/recent"),
  getStats: (params) => api.get("/stock-movements/stats", { params }),
  getUsageAnalytics: (params) => api.get("/stock-movements/usage-analytics", { params }),
  getCostAnalysis: (params) => api.get("/stock-movements/cost-analysis", { params }),
};

// Reports API
export const reportsAPI = {
  getDashboardStats: () => api.get("/reports/dashboard"),
  getInventoryReport: (params) => api.get("/reports/inventory", { params }),
  getUsageTrends: (params) => api.get("/reports/usage-trends", { params }),
  getCostAnalysis: (params) => api.get("/reports/cost-analysis", { params }),
  getReorderRecommendations: () => api.get("/reports/reorder-recommendations"),
  getLowStockSummary: () => api.get("/reports/low-stock-summary"),
  getStockValue: () => api.get("/reports/stock-value"),
  exportReport: (type, params) =>
    api.get(`/reports/export/${type}`, {
      params,
      responseType: "blob",
    }),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post("/users", user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
  getCurrentUser: () => api.get("/users/me"),
};

export default api;
