// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

// Calculate stock status
export const getStockStatus = (currentStock, minStock, reorderPoint) => {
  if (currentStock === 0) {
    return { status: "Out of Stock", color: "error", severity: "critical" };
  }
  if (currentStock <= minStock) {
    return { status: "Critical Low", color: "error", severity: "critical" };
  }
  if (currentStock <= reorderPoint) {
    return { status: "Low Stock", color: "warning", severity: "warning" };
  }
  return { status: "In Stock", color: "success", severity: "normal" };
};

// Calculate stock percentage
export const getStockPercentage = (currentStock, maxStock) => {
  return Math.min((currentStock / maxStock) * 100, 100);
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Sort array by key
export const sortBy = (array, key, direction = "asc") => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Filter array by multiple criteria
export const filterItems = (items, filters) => {
  return items.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;

      const itemValue = item[key];
      const filterValue = filters[key];

      if (typeof filterValue === "string") {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      return itemValue === filterValue;
    });
  });
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error getting from localStorage:", error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting to localStorage:", error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
