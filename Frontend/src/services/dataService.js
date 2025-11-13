// Backend-ready service layer
// Currently uses dummy data, but structured to easily switch to real API calls

import {
  categories,
  suppliers,
  products,
  inventory,
  stockMovements,
  dashboardStats,
  usageData,
  categoryDistribution,
  reportsData,
  notifications,
  users
} from '../utils/dummyData';

// Configuration
const USE_DUMMY_DATA = false; // Set to false when backend is ready
const API_BASE_URL = 'http://localhost:5000/api';

// Simulate API delay for realistic experience
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Generic API call function with error handling
const apiCall = async (endpoint, options = {}) => {
  if (USE_DUMMY_DATA) {
    await simulateDelay();
    // Return dummy data based on endpoint
    return { success: true, data: null };
  } else {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred'
      };
    }
  }
};

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(300);
      return { success: true, data: dashboardStats };
    }
    return await apiCall('/reports/dashboard');
  },
  
  getRecentMovements: async (limit = 10) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      return { success: true, data: stockMovements.slice(0, limit) };
    }
    return await apiCall(`/stock-movements?limit=${limit}`);
  },
  
  getLowStockAlerts: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      const lowStock = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock');
      return { success: true, data: lowStock };
    }
    return await apiCall('/inventory/low-stock');
  },
  
  getUsageData: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      return { success: true, data: usageData };
    }
    return await apiCall('/reports/usage-trends');
  },
  
  getCategoryDistribution: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      return { success: true, data: categoryDistribution };
    }
    return await apiCall('/reports/category-distribution');
  }
};

// Product Service
export const productService = {
  getAll: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(400);
      let filtered = [...products];
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category_id === filters.category);
      }
      if (filters.supplier) {
        filtered = filtered.filter(p => p.supplier_id === filters.supplier);
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.sku.toLowerCase().includes(search)
        );
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/products${queryParams ? '?' + queryParams : ''}`);
  },
  
  getById: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      const product = products.find(p => p.id === parseInt(id));
      return {
        success: !!product,
        data: product
      };
    }
    return await apiCall(`/products/${id}`);
  },
  
  create: async (productData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const newProduct = {
        id: products.length + 1,
        ...productData,
        status: 'Active'
      };
      products.push(newProduct);
      return {
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      };
    }
    return await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  
  update: async (id, productData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        products[index] = { ...products[index], ...productData };
        return {
          success: true,
          data: products[index],
          message: 'Product updated successfully'
        };
      }
      return {
        success: false,
        message: 'Product not found'
      };
    }
    return await apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  
  delete: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = products.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        products.splice(index, 1);
        return {
          success: true,
          message: 'Product deleted successfully'
        };
      }
      return {
        success: false,
        message: 'Product not found'
      };
    }
    return await apiCall(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// Inventory Service
export const inventoryService = {
  getAll: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(400);
      let filtered = [...inventory];
      
      if (filters.category) {
        filtered = filtered.filter(i => i.category === filters.category);
      }
      if (filters.storage_area) {
        filtered = filtered.filter(i => i.storage_area === filters.storage_area);
      }
      if (filters.frequency) {
        filtered = filtered.filter(i => i.frequency_of_use === filters.frequency);
      }
      if (filters.status) {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.product_name.toLowerCase().includes(search) || 
          i.sku.toLowerCase().includes(search)
        );
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/inventory${queryParams ? '?' + queryParams : ''}`);
  },
  
  getById: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      const item = inventory.find(i => i.id === parseInt(id));
      return {
        success: !!item,
        data: item
      };
    }
    return await apiCall(`/inventory/${id}`);
  },
  
  updateStock: async (id, stockData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = inventory.findIndex(i => i.id === parseInt(id));
      if (index !== -1) {
        const oldQuantity = inventory[index].quantity;
        const newQuantity = stockData.quantity;
        
        inventory[index] = {
          ...inventory[index],
          quantity: newQuantity,
          last_restocked: new Date().toISOString().split('T')[0],
          status: newQuantity > inventory[index].reorder_point ? 'In Stock' : 
                  newQuantity > 0 ? 'Low Stock' : 'Out of Stock'
        };
        
        return {
          success: true,
          data: inventory[index],
          message: 'Stock updated successfully'
        };
      }
      return {
        success: false,
        message: 'Inventory item not found'
      };
    }
    return await apiCall(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData)
    });
  },
  
  getLowStock: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(300);
      const lowStock = inventory.filter(item => 
        item.quantity <= item.reorder_point && item.quantity > 0
      );
      return {
        success: true,
        data: lowStock
      };
    }
    return await apiCall('/inventory/low-stock');
  },
  
  getExpiringSoon: async (days = 30) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(300);
      const expiring = inventory.filter(item => {
        if (!item.expiry_date) return false;
        const daysUntilExpiry = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= days && daysUntilExpiry > 0;
      });
      return {
        success: true,
        data: expiring
      };
    }
    return await apiCall(`/inventory/expiring-soon?days=${days}`);
  }
};

// Stock Movement Service
export const stockMovementService = {
  getAll: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(400);
      let filtered = [...stockMovements];
      
      if (filters.type) {
        filtered = filtered.filter(m => m.type === filters.type);
      }
      if (filters.product_id) {
        filtered = filtered.filter(m => m.product_id === parseInt(filters.product_id));
      }
      if (filters.startDate) {
        filtered = filtered.filter(m => new Date(m.date) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        filtered = filtered.filter(m => new Date(m.date) <= new Date(filters.endDate));
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/stock-movements${queryParams ? '?' + queryParams : ''}`);
  },
  
  create: async (movementData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const newMovement = {
        id: stockMovements.length + 1,
        ...movementData,
        date: new Date().toISOString().split('T')[0]
      };
      stockMovements.unshift(newMovement);
      
      // Update inventory
      if (movementData.type !== 'ADJUST') {
        const invIndex = inventory.findIndex(i => i.product_id === movementData.product_id);
        if (invIndex !== -1) {
          const change = movementData.type === 'IN' ? movementData.quantity : -movementData.quantity;
          inventory[invIndex].quantity += change;
          inventory[invIndex].status = inventory[invIndex].quantity > inventory[invIndex].reorder_point ? 'In Stock' : 
                                        inventory[invIndex].quantity > 0 ? 'Low Stock' : 'Out of Stock';
        }
      }
      
      return {
        success: true,
        data: newMovement,
        message: 'Stock movement recorded successfully'
      };
    }
    return await apiCall('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  }
};

// Category Service
export const categoryService = {
  getAll: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(300);
      return {
        success: true,
        data: categories
      };
    }
    return await apiCall('/categories');
  },
  
  getById: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      const category = categories.find(c => c.id === parseInt(id));
      return {
        success: !!category,
        data: category
      };
    }
    return await apiCall(`/categories/${id}`);
  },
  
  create: async (categoryData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const newCategory = {
        id: categories.length + 1,
        ...categoryData,
        itemCount: 0
      };
      categories.push(newCategory);
      return {
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      };
    }
    return await apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },
  
  update: async (id, categoryData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = categories.findIndex(c => c.id === parseInt(id));
      if (index !== -1) {
        categories[index] = { ...categories[index], ...categoryData };
        return {
          success: true,
          data: categories[index],
          message: 'Category updated successfully'
        };
      }
      return {
        success: false,
        message: 'Category not found'
      };
    }
    return await apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },
  
  delete: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = categories.findIndex(c => c.id === parseInt(id));
      if (index !== -1) {
        categories.splice(index, 1);
        return {
          success: true,
          message: 'Category deleted successfully'
        };
      }
      return {
        success: false,
        message: 'Category not found'
      };
    }
    return await apiCall(`/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

// Supplier Service
export const supplierService = {
  getAll: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(300);
      let filtered = [...suppliers];
      
      if (filters.status) {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(search) || 
          s.contact.toLowerCase().includes(search)
        );
      }
      
      return {
        success: true,
        data: filtered
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/suppliers${queryParams ? '?' + queryParams : ''}`);
  },
  
  getById: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(200);
      const supplier = suppliers.find(s => s.id === parseInt(id));
      return {
        success: !!supplier,
        data: supplier
      };
    }
    return await apiCall(`/suppliers/${id}`);
  },
  
  create: async (supplierData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const newSupplier = {
        id: suppliers.length + 1,
        ...supplierData,
        productsSupplied: 0,
        rating: 0,
        status: 'Active'
      };
      suppliers.push(newSupplier);
      return {
        success: true,
        data: newSupplier,
        message: 'Supplier created successfully'
      };
    }
    return await apiCall('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },
  
  update: async (id, supplierData) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = suppliers.findIndex(s => s.id === parseInt(id));
      if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...supplierData };
        return {
          success: true,
          data: suppliers[index],
          message: 'Supplier updated successfully'
        };
      }
      return {
        success: false,
        message: 'Supplier not found'
      };
    }
    return await apiCall(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },
  
  delete: async (id) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      const index = suppliers.findIndex(s => s.id === parseInt(id));
      if (index !== -1) {
        suppliers.splice(index, 1);
        return {
          success: true,
          message: 'Supplier deleted successfully'
        };
      }
      return {
        success: false,
        message: 'Supplier not found'
      };
    }
    return await apiCall(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  }
};

// Reports Service
export const reportsService = {
  getUsageReport: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(600);
      let data = [...reportsData.usageReport];
      
      if (filters.category) {
        data = data.filter(item => item.category === filters.category);
      }
      if (filters.frequency) {
        data = data.filter(item => item.frequency === filters.frequency);
      }
      
      return {
        success: true,
        data: data
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/reports/usage${queryParams ? '?' + queryParams : ''}`);
  },
  
  getCostAnalysis: async (filters = {}) => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(600);
      return {
        success: true,
        data: reportsData.costAnalysis
      };
    }
    
    const queryParams = new URLSearchParams(filters).toString();
    return await apiCall(`/reports/cost-analysis${queryParams ? '?' + queryParams : ''}`);
  },
  
  getStockValue: async () => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(500);
      return {
        success: true,
        data: reportsData.stockValue
      };
    }
    return await apiCall('/reports/stock-value');
  },
  
  exportReport: async (reportType, format = 'csv') => {
    if (USE_DUMMY_DATA) {
      await simulateDelay(1000);
      return {
        success: true,
        message: `Report exported as ${format.toUpperCase()}`
      };
    }
    return await apiCall(`/reports/export/${reportType}?format=${format}`);
  }
};

// Notification Service
export const notificationService = {
  getAll: async (unreadOnly = false) => {
    await simulateDelay(200);
    const filtered = unreadOnly ? notifications.filter(n => !n.read) : notifications;
    return {
      success: true,
      data: filtered
    };
  },
  
  markAsRead: async (id) => {
    await simulateDelay(200);
    const notification = notifications.find(n => n.id === parseInt(id));
    if (notification) {
      notification.read = true;
      return {
        success: true,
        message: 'Notification marked as read'
      };
    }
    return {
      success: false,
      message: 'Notification not found'
    };
  },
  
  markAllAsRead: async () => {
    await simulateDelay(300);
    notifications.forEach(n => n.read = true);
    return {
      success: true,
      message: 'All notifications marked as read'
    };
  }
};

// User Service (for future authentication integration)
export const userService = {
  getAll: async () => {
    await simulateDelay(300);
    return {
      success: true,
      data: users
    };
  },
  
  getCurrentUser: async () => {
    await simulateDelay(200);
    return {
      success: true,
      data: users[0] // Return admin for development
    };
  }
};

export default {
  dashboard: dashboardService,
  products: productService,
  inventory: inventoryService,
  stockMovements: stockMovementService,
  categories: categoryService,
  suppliers: supplierService,
  reports: reportsService,
  notifications: notificationService,
  users: userService
};
