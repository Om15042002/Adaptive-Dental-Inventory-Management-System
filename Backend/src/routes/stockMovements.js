const express = require("express");
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require("../config/database");
const router = express.Router();

// Get all stock movements
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, movementType, productId } = req.query;

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

    if (productId) {
      query += ` AND sm.product_id = ?`;
      params.push(productId);
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

// Get stock movement by ID
router.get("/:id", async (req, res) => {
  try {
    const connection = await connectDB();
    const [movements] = await connection.execute(
      `SELECT 
        sm.*,
        p.name as product_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.id = ?`,
      [req.params.id]
    );
    await connection.end();

    if (movements.length === 0) {
      return res
        .status(404)
        .json(formatResponse(null, "Stock movement not found", 404));
    }

    res.json(formatResponse(movements[0]));
  } catch (error) {
    console.error("Error fetching stock movement:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error fetching stock movement", 500));
  }
});

// Create stock movement (IN/OUT)
router.post("/", async (req, res) => {
  try {
    const { product_id, movement_type, quantity, notes } = req.body;

    const connection = await connectDB();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert stock movement record
      const [result] = await connection.execute(
        `INSERT INTO stock_movements 
         (product_id, movement_type, quantity, notes)
         VALUES (?, ?, ?, ?)`,
        [product_id, movement_type, quantity, notes]
      );

      // Update inventory based on movement type
      if (movement_type === "IN") {
        await connection.execute(
          `UPDATE inventory 
           SET current_stock = current_stock + ?
           WHERE product_id = ?`,
          [quantity, product_id]
        );
      } else if (movement_type === "OUT") {
        await connection.execute(
          `UPDATE inventory 
           SET current_stock = current_stock - ?
           WHERE product_id = ?`,
          [quantity, product_id]
        );
      }

      await connection.commit();
      await connection.end();

      res
        .status(201)
        .json(
          formatResponse(
            { id: result.insertId },
            "Stock movement recorded successfully"
          )
        );
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
  } catch (error) {
    console.error("Error creating stock movement:", error);
    res
      .status(500)
      .json(formatResponse(null, "Error creating stock movement", 500));
  }
});

// Get stock movement history for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const connection = await connectDB();
    const [movements] = await connection.execute(
      `SELECT 
        sm.*,
        p.name as product_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.product_id = ?
       ORDER BY sm.created_at DESC`,
      [req.params.productId]
    );
    await connection.end();

    res.json(formatResponse(movements));
  } catch (error) {
    console.error("Error fetching product stock movements:", error);
    res
      .status(500)
      .json(
        formatResponse(null, "Error fetching product stock movements", 500)
      );
  }
});

// Get stock movement statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
      dateFilter = "WHERE created_at BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const connection = await connectDB();

    // Get movement counts by type
    const [movementCounts] = await connection.execute(
      `SELECT 
        movement_type,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
       FROM stock_movements
       ${dateFilter}
       GROUP BY movement_type`,
      params
    );

    // Get most active products
    const [activeProducts] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        COUNT(sm.id) as movement_count,
        SUM(sm.quantity) as total_moved
       FROM products p
       JOIN stock_movements sm ON p.id = sm.product_id
       ${dateFilter}
       GROUP BY p.id
       ORDER BY movement_count DESC
       LIMIT 10`,
      params
    );

    await connection.end();

    res.json(
      formatResponse({
        movementCounts,
        activeProducts,
      })
    );
  } catch (error) {
    console.error("Error fetching stock movement statistics:", error);
    res
      .status(500)
      .json(
        formatResponse(null, "Error fetching stock movement statistics", 500)
      );
  }
});

module.exports = router;
