// Test API connectivity
import { reportsAPI, productsAPI, categoriesAPI } from "../services/api";

export const testAPIConnection = async () => {
  try {
    console.log("Testing API connection...");

    // Test basic API endpoints
    const tests = [
      { name: "Dashboard Stats", fn: () => reportsAPI.getDashboardStats() },
      { name: "Products", fn: () => productsAPI.getAll() },
      { name: "Categories", fn: () => categoriesAPI.getAll() },
    ];

    const results = [];

    for (const test of tests) {
      try {
        console.log(`Testing ${test.name}...`);
        const result = await test.fn();
        results.push({ name: test.name, success: true, data: result });
        console.log(`✅ ${test.name} - Success:`, result);
      } catch (error) {
        results.push({ name: test.name, success: false, error: error.message });
        console.log(`❌ ${test.name} - Error:`, error.message);
      }
    }

    return results;
  } catch (error) {
    console.error("API Connection Test Failed:", error);
    return { error: error.message };
  }
};

// Test individual endpoints
export const testEndpoint = async (endpointName) => {
  const endpoints = {
    dashboard: () => reportsAPI.getDashboardStats(),
    products: () => productsAPI.getAll(),
    categories: () => categoriesAPI.getAll(),
    inventory: () => inventoryAPI.getAll(),
  };

  if (!endpoints[endpointName]) {
    throw new Error(`Unknown endpoint: ${endpointName}`);
  }

  try {
    const result = await endpoints[endpointName]();
    console.log(`✅ ${endpointName} endpoint working:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${endpointName} endpoint failed:`, error);
    throw error;
  }
};
