const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get dashboard overview statistics
router.get("/dashboard", async (req, res) => {
  try {
    const connection = await connectDB();

    // Get total products count
    const [productCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM products`
    );

    // Get total categories count
    const [categoryCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM categories`
    );

    // Get low stock items count
    const [lowStockCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM inventory WHERE current_stock <= min_stock`
    );

    // Get total inventory value
    const [inventoryValue] = await connection.execute(
      `SELECT SUM(i.current_stock * p.unit_cost) as total_value
       FROM inventory i
       JOIN products p ON i.product_id = p.id`
    );

    // Get recent stock movements
    const [recentMovements] = await connection.execute(
      `SELECT sm.*, p.name as product_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       ORDER BY sm.created_at DESC
       LIMIT 10`
    );

    // Get category breakdown
    const [categoryBreakdown] = await connection.execute(
      `SELECT c.name, COUNT(p.id) as product_count,
              SUM(i.current_stock) as total_quantity
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       LEFT JOIN inventory i ON p.id = i.product_id
       GROUP BY c.id, c.name`
    );

    await connection.end();

    const dashboardData = {
      totalProducts: productCount[0].count,
      totalCategories: categoryCount[0].count,
      lowStockItems: lowStockCount[0].count,
      totalInventoryValue: inventoryValue[0].total_value || 0,
      recentMovements,
      categoryBreakdown,
    };

    res.json(formatResponse(dashboardData));
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching dashboard data", 500));
  }
});

// Get inventory valuation report
router.get("/inventory-valuation", async (req, res) => {
  try {
    const connection = await connectDB();
    const [valuation] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        c.name as category_name,
        p.unit_cost,
        i.current_stock,
        (p.unit_cost * i.current_stock) as total_value
       FROM products p
       JOIN inventory i ON p.id = i.product_id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY total_value DESC`
    );
    await connection.end();

    res.json(formatResponse(valuation));
  } catch (error) {
    console.error("Error fetching inventory valuation:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching inventory valuation", 500));
  }
});

// Get stock movement report
router.get("/stock-movements", async (req, res) => {
  try {
    const { startDate, endDate, movementType } = req.query;

    let query = `
      SELECT 
        sm.*,
        p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ` AND sm.created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND sm.created_at <= ?`;
      params.push(endDate);
    }

    if (movementType) {
      query += ` AND sm.movement_type = ?`;
      params.push(movementType);
    }

    query += ` ORDER BY sm.created_at DESC`;

    const connection = await connectDB();
    const [movements] = await connection.execute(query, params);
    await connection.end();

    res.json(formatResponse(movements));
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching stock movements", 500));
  }
});

// Get low stock report
router.get("/low-stock", async (req, res) => {
  try {
    const connection = await connectDB();
    const [lowStock] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        c.name as category_name,
        i.current_stock,
        i.min_stock,
        (i.min_stock - i.current_stock) as shortage
       FROM products p
       JOIN inventory i ON p.id = i.product_id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.current_stock <= i.min_stock
       ORDER BY shortage DESC`
    );
    await connection.end();

    res.json(formatResponse(lowStock));
  } catch (error) {
    console.error("Error fetching low stock report:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching low stock report", 500));
  }
});

// Get supplier performance report
router.get("/supplier-performance", async (req, res) => {
  try {
    const connection = await connectDB();
    const [performance] = await connection.execute(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        COUNT(DISTINCT p.id) as total_products
       FROM suppliers s
       LEFT JOIN products p ON s.id = p.supplier_id
       GROUP BY s.id
       ORDER BY total_products DESC`
    );
    await connection.end();

    res.json(formatResponse(performance));
  } catch (error) {
    console.error("Error fetching supplier performance:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching supplier performance", 500));
  }
});

module.exports = router;
