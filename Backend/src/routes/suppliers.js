const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const connection = await connectDB();
    const [suppliers] = await connection.execute(
      `SELECT s.*, COUNT(p.id) as product_count
       FROM suppliers s
       LEFT JOIN products p ON s.id = p.supplier_id
       GROUP BY s.id
       ORDER BY s.name`
    );
    await connection.end();

    res.json(formatResponse(suppliers));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json(formatResponse(null, "Error fetching suppliers", 500));
  }
});

// Get supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const connection = await connectDB();
    const [suppliers] = await connection.execute(
      `SELECT * FROM suppliers WHERE id = ?`,
      [req.params.id]
    );

    if (suppliers.length === 0) {
      await connection.end();
      return res
        .status(404)
        .json(formatResponse(null, "Supplier not found", 404));
    }

    // Get products supplied by this supplier
    const [products] = await connection.execute(
      `SELECT p.*
       FROM products p
       WHERE p.supplier_id = ?`,
      [req.params.id]
    );

    await connection.end();

    const supplierData = {
      ...suppliers[0],
      products,
    };

    res.json(formatResponse(supplierData));
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json(formatResponse(null, "Error fetching supplier", 500));
  }
});

// Create supplier
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const connection = await connectDB();
    const [result] = await connection.execute(
      `INSERT INTO suppliers (name, email, phone) 
       VALUES (?, ?, ?)`,
      [name, email, phone]
    );
    await connection.end();

    res
      .status(201)
      .json(
        formatResponse({ id: result.insertId }, "Supplier created successfully")
      );
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json(formatResponse(null, "Error creating supplier", 500));
  }
});

// Update supplier
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const connection = await connectDB();
    await connection.execute(
      `UPDATE suppliers 
       SET name=?, email=?, phone=?
       WHERE id=?`,
      [name, email, phone, req.params.id]
    );
    await connection.end();

    res.json(formatResponse(null, "Supplier updated successfully"));
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json(formatResponse(null, "Error updating supplier", 500));
  }
});

// Delete supplier
router.delete("/:id", async (req, res) => {
  try {
    const connection = await connectDB();

    // Check if supplier has products
    const [products] = await connection.execute(
      `SELECT COUNT(*) as count FROM products WHERE supplier_id = ?`,
      [req.params.id]
    );

    if (products[0].count > 0) {
      await connection.end();
      return res
        .status(400)
        .json(
          formatResponse(
            null,
            "Cannot delete supplier with associated products",
            400
          )
        );
    }

    // Delete supplier
    await connection.execute(`DELETE FROM suppliers WHERE id = ?`, [
      req.params.id,
    ]);

    await connection.end();

    res.json(formatResponse(null, "Supplier deleted successfully"));
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json(formatResponse(null, "Error deleting supplier", 500));
  }
});

module.exports = router;
