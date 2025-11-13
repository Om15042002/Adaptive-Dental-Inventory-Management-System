const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const connection = await connectDB();
    const [products] = await connection.execute(
      `SELECT p.*, c.name as category_name, i.current_stock, i.min_stock, i.max_stock
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       ORDER BY p.created_at DESC`
    );
    await connection.end();

    res.json(formatResponse(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json(formatResponse(null, "Error fetching products", 500));
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const connection = await connectDB();
    const [products] = await connection.execute(
      `SELECT p.*, 
              c.name as category_name, 
              i.current_stock, 
              i.min_stock, 
              i.max_stock,
              s.name as supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    await connection.end();

    if (products.length === 0) {
      return res
        .status(404)
        .json(formatResponse(null, "Product not found", 404));
    }

    res.json(formatResponse(products[0]));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json(formatResponse(null, "Error fetching product", 500));
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      categoryId,
      supplierId,
      unitPrice,
      minStockLevel,
      maxStockLevel,
      reorderFrequency,
    } = req.body;

    const connection = await connectDB();

    // Insert product
    const [result] = await connection.execute(
      `INSERT INTO products (name, category_id, supplier_id, unit_cost, reorder_frequency)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        categoryId || null,
        supplierId || null,
        unitPrice || 0,
        reorderFrequency || "Monthly",
      ]
    );

    const productId = result.insertId;

    // Create inventory record
    await connection.execute(
      `INSERT INTO inventory (product_id, current_stock, min_stock, max_stock)
       VALUES (?, 0, ?, ?)`,
      [productId, minStockLevel || 10, maxStockLevel || 100]
    );

    await connection.end();

    res
      .status(201)
      .json(formatResponse({ id: productId }, "Product created successfully"));
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json(formatResponse(null, "Error creating product", 500));
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      categoryId,
      supplierId,
      unitPrice,
      minStockLevel,
      maxStockLevel,
      reorderFrequency,
    } = req.body;

    const connection = await connectDB();

    // Update product
    await connection.execute(
      `UPDATE products SET name=?, category_id=?, supplier_id=?, unit_cost=?, reorder_frequency=?
       WHERE id=?`,
      [
        name,
        categoryId || null,
        supplierId || null,
        unitPrice || 0,
        reorderFrequency || "Monthly",
        req.params.id,
      ]
    );

    // Update inventory
    await connection.execute(
      `UPDATE inventory SET min_stock=?, max_stock=?
       WHERE product_id=?`,
      [minStockLevel || 10, maxStockLevel || 100, req.params.id]
    );

    await connection.end();

    res.json(formatResponse(null, "Product updated successfully"));
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json(formatResponse(null, "Error updating product", 500));
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const connection = await connectDB();

    // Delete inventory first (foreign key constraint)
    await connection.execute(`DELETE FROM inventory WHERE product_id = ?`, [
      req.params.id,
    ]);

    // Delete product
    await connection.execute(`DELETE FROM products WHERE id = ?`, [
      req.params.id,
    ]);

    await connection.end();

    res.json(formatResponse(null, "Product deleted successfully"));
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json(formatResponse(null, "Error deleting product", 500));
  }
});

// Bulk delete products
router.delete("/", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(formatResponse(null, "Invalid product IDs", 400));
    }

    const connection = await connectDB();
    const placeholders = ids.map(() => "?").join(",");

    await connection.execute(
      `DELETE FROM inventory WHERE product_id IN (${placeholders})`,
      ids
    );
    await connection.execute(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      ids
    );

    await connection.end();

    res.json(
      formatResponse(null, `${ids.length} products deleted successfully`)
    );
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    res.status(500).json(formatResponse(null, "Error deleting products", 500));
  }
});

// Search products
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json(formatResponse(null, "Search query required", 400));
    }

    const connection = await connectDB();
    const [products] = await connection.execute(
      `SELECT p.*, c.name as category FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?
       LIMIT 20`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    await connection.end();

    res.json(formatResponse(products));
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json(formatResponse(null, "Error searching products", 500));
  }
});

module.exports = router;
