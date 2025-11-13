/**
 * Inventory Controller
 * Handles business logic for inventory operations
 */

const { connectDB } = require('../config/database');
const { formatResponse, asyncHandler } = require('../utils/helpers');
const Inventory = require('../models/Inventory');

const inventoryModel = new Inventory();

/**
 * Get all inventory items with pagination and filtering
 */
exports.getAllInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', sortBy = 'last_updated' } = req.query;
  const offset = (page - 1) * limit;

  try {
    const connection = await connectDB();

    let query = `
      SELECT 
        i.*,
        p.name as product_name,
        p.sku,
        p.unit_cost,
        c.name as category_name,
        CASE 
          WHEN i.current_stock <= i.min_stock THEN 'LOW'
          WHEN i.current_stock >= i.max_stock THEN 'OVERSTOCK'
          ELSE 'NORMAL'
        END as stock_status,
        (i.current_stock * p.unit_cost) as inventory_value
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
    `;

    const params = [];

    if (search) {
      query += ` WHERE p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY i.${sortBy} DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [inventory] = await connection.execute(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
    `;

    if (search) {
      countQuery += ` WHERE p.name LIKE ?`;
      const [countResult] = await connection.execute(countQuery, [`%${search}%`]);
      await connection.end();
      return res.json(
        formatResponse(inventory, 'Inventory fetched successfully', 200, {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit),
        })
      );
    }

    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM inventory`
    );
    await connection.end();

    res.json(
      formatResponse(inventory, 'Inventory fetched successfully', 200, {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit),
      })
    );
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json(formatResponse(null, 'Failed to fetch inventory', 500));
  }
});

/**
 * Get inventory by product ID
 */
exports.getInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  try {
    const connection = await connectDB();
    const [inventory] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.sku,
        p.unit_cost,
        c.name as category_name,
        (i.current_stock * p.unit_cost) as inventory_value
       FROM inventory i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.product_id = ?`,
      [productId]
    );

    await connection.end();

    if (!inventory || inventory.length === 0) {
      return res.status(404).json(formatResponse(null, 'Inventory not found', 404));
    }

    res.json(formatResponse(inventory[0]));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json(formatResponse(null, 'Failed to fetch inventory', 500));
  }
});

/**
 * Update inventory levels for a product
 */
exports.updateInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { current_stock, min_stock, max_stock, reorder_level } = req.body;

  // Validate input
  const validation = inventoryModel.validate({
    product_id: productId,
    current_stock,
    min_stock,
    max_stock,
  });

  if (!validation.isValid) {
    return res.status(400).json(formatResponse(null, validation.errors.join(', '), 400));
  }

  try {
    const connection = await connectDB();

    const [result] = await connection.execute(
      `UPDATE inventory 
       SET current_stock = ?,
           min_stock = ?,
           max_stock = ?,
           reorder_level = ?,
           last_updated = NOW()
       WHERE product_id = ?`,
      [current_stock, min_stock, max_stock, reorder_level, productId]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(null, 'Inventory not found', 404));
    }

    res.json(formatResponse(null, 'Inventory updated successfully'));
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json(formatResponse(null, 'Failed to update inventory', 500));
  }
});

/**
 * Get low stock alerts
 */
exports.getLowStockAlerts = asyncHandler(async (req, res) => {
  try {
    const connection = await connectDB();

    const [alerts] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.sku,
        p.unit_cost,
        c.name as category_name,
        (i.min_stock - i.current_stock) as shortage
       FROM inventory i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.current_stock <= i.min_stock
       ORDER BY i.current_stock ASC`
    );

    await connection.end();

    res.json(formatResponse(alerts, `Found ${alerts.length} low stock items`));
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json(formatResponse(null, 'Failed to fetch alerts', 500));
  }
});

/**
 * Get overstock items
 */
exports.getOverstockItems = asyncHandler(async (req, res) => {
  try {
    const connection = await connectDB();

    const [items] = await connection.execute(
      `SELECT 
        i.*,
        p.name as product_name,
        p.sku,
        p.unit_cost,
        c.name as category_name,
        (i.current_stock - i.max_stock) as excess
       FROM inventory i
       LEFT JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.current_stock >= i.max_stock
       ORDER BY i.current_stock DESC`
    );

    await connection.end();

    res.json(formatResponse(items, `Found ${items.length} overstock items`));
  } catch (error) {
    console.error('Error fetching overstock items:', error);
    res.status(500).json(formatResponse(null, 'Failed to fetch overstock', 500));
  }
});

/**
 * Get inventory dashboard statistics
 */
exports.getInventoryStats = asyncHandler(async (req, res) => {
  try {
    const connection = await connectDB();

    const [totalValue] = await connection.execute(
      `SELECT 
        SUM(i.current_stock * COALESCE(p.unit_cost, 0)) as total_value,
        COUNT(i.id) as total_items,
        SUM(i.current_stock) as total_units
       FROM inventory i
       LEFT JOIN products p ON i.product_id = p.id`
    );

    const [lowStockCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM inventory WHERE current_stock <= min_stock`
    );

    const [overstockCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM inventory WHERE current_stock >= max_stock`
    );

    await connection.end();

    res.json(
      formatResponse({
        totalValue: totalValue[0]?.total_value || 0,
        totalItems: totalValue[0]?.total_items || 0,
        totalUnits: totalValue[0]?.total_units || 0,
        lowStockCount: lowStockCount[0]?.count || 0,
        overstockCount: overstockCount[0]?.count || 0,
      })
    );
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json(formatResponse(null, 'Failed to fetch statistics', 500));
  }
});
