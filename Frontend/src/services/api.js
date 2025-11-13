import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Request interceptor for authentication and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache GET requests
    if (config.method === "get") {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: "OK (cached)",
            headers: {},
            config,
          });
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === "get" && response.status === 200) {
      const cacheKey = `${response.config.url}${JSON.stringify(
        response.config.params || {}
      )}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

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

// Clear cache function
export const clearCache = () => {
  requestCache.clear();
};

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
  bulkDelete: (ids) => api.delete("/products/bulk", { data: { ids } }),
  search: (query) => api.get("/products/search", { params: { q: query } }),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params) => api.get("/inventory", { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  update: (productId, inventoryData) =>
    api.put(`/inventory/${productId}`, inventoryData),
  updateStock: (id, stockData) => api.put(`/inventory/${id}/stock`, stockData),
  getLowStock: () => api.get("/inventory/low-stock"),
  getStockHistory: (id) => api.get(`/inventory/${id}/history`),
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

// Reports API
export const reportsAPI = {
  getDashboardStats: () => api.get("/reports/dashboard"),
  getInventoryReport: (params) => api.get("/reports/inventory", { params }),
  getUsageTrends: (params) => api.get("/reports/usage-trends", { params }),
  getCostAnalysis: (params) => api.get("/reports/cost-analysis", { params }),
  getReorderRecommendations: () => api.get("/reports/reorder-recommendations"),
  exportReport: (type, params) =>
    api.get(`/reports/export/${type}`, {
      params,
      responseType: "blob",
    }),
};

// Stock Movements API
export const stockMovementsAPI = {
  getAll: (params) => api.get("/stock-movements", { params }),
  create: (movement) => api.post("/stock-movements", movement),
  getByProduct: (productId) => api.get(`/stock-movements/product/${productId}`),
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
