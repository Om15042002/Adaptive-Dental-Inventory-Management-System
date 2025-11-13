const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const connection = await connectDB();
    const [categories] = await connection.execute(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );
    await connection.end();

    res.json(formatResponse(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching categories", 500));
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const connection = await connectDB();
    const [categories] = await connection.execute(
      `SELECT * FROM categories WHERE id = ?`,
      [req.params.id]
    );
    await connection.end();

    if (categories.length === 0) {
      return res
        .status(404)
        .json(formatResponse(null, "Category not found", 404));
    }

    res.json(formatResponse(categories[0]));
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json(formatResponse(null, "Error fetching category", 500));
  }
});

// Create category
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    const connection = await connectDB();
    const [result] = await connection.execute(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      [name, description]
    );
    await connection.end();

    res
      .status(201)
      .json(
        formatResponse({ id: result.insertId }, "Category created successfully")
      );
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json(formatResponse(null, "Error creating category", 500));
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;

    const connection = await connectDB();
    await connection.execute(
      `UPDATE categories SET name=?, description=? WHERE id=?`,
      [name, description, req.params.id]
    );
    await connection.end();

    res.json(formatResponse(null, "Category updated successfully"));
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json(formatResponse(null, "Error updating category", 500));
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const connection = await connectDB();

    // Check if category has products
    const [products] = await connection.execute(
      `SELECT COUNT(*) as count FROM products WHERE category_id = ?`,
      [req.params.id]
    );

    if (products[0].count > 0) {
      await connection.end();
      return res
        .status(400)
        .json(
          formatResponse(
            null,
            "Cannot delete category with associated products",
            400
          )
        );
    }

    await connection.execute(`DELETE FROM categories WHERE id = ?`, [
      req.params.id,
    ]);
    await connection.end();

    res.json(formatResponse(null, "Category deleted successfully"));
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json(formatResponse(null, "Error deleting category", 500));
  }
});

module.exports = router;
