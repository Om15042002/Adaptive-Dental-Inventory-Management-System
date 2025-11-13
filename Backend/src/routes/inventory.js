const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get all inventory items with product details
router.get("/", async (req, res) => {
  try {
    const connection = await connectDB();
    const [inventory] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.unit_cost,
        c.name as category_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY i.last_updated DESC`
    );
    await connection.end();

    res.json(formatResponse(inventory));
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json(formatResponse(null, "Error fetching inventory", 500));
  }
});

// Get inventory item by product ID
router.get("/:productId", async (req, res) => {
  try {
    const connection = await connectDB();
    const [inventory] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.unit_cost,
        c.name as category_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.product_id = ?`,
      [req.params.productId]
    );
    await connection.end();

    if (inventory.length === 0) {
      return res
        .status(404)
        .json(formatResponse(null, "Inventory item not found", 404));
    }

    res.json(formatResponse(inventory[0]));
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching inventory item", 500));
  }
});

// Update inventory quantity
router.put("/:productId", async (req, res) => {
  try {
    const { current_stock, min_stock, max_stock } = req.body;

    const connection = await connectDB();
    await connection.execute(
      `UPDATE inventory 
       SET current_stock = ?, 
           min_stock = ?, 
           max_stock = ?
       WHERE product_id = ?`,
      [current_stock, min_stock, max_stock, req.params.productId]
    );
    await connection.end();

    res.json(formatResponse(null, "Inventory updated successfully"));
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json(formatResponse(null, "Error updating inventory", 500));
  }
});

// Get low stock items
router.get("/alerts/low-stock", async (req, res) => {
  try {
    const connection = await connectDB();
    const [inventory] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.unit_cost,
        c.name as category_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.current_stock <= i.min_stock
       ORDER BY i.current_stock ASC`
    );
    await connection.end();

    res.json(formatResponse(inventory));
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching low stock items", 500));
  }
});

// Get overstock items
router.get("/alerts/overstock", async (req, res) => {
  try {
    const connection = await connectDB();
    const [inventory] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.unit_cost,
        c.name as category_name
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.current_stock >= i.max_stock
       ORDER BY i.current_stock DESC`
    );
    await connection.end();

    res.json(formatResponse(inventory));
  } catch (error) {
    console.error("Error fetching overstock items:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching overstock items", 500));
  }
});

module.exports = router;
