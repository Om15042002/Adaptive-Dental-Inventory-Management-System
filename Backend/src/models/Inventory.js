/**
 * Inventory Model
 * Represents inventory data structure and business logic
 */

class Inventory {
  constructor() {
    this.tableName = 'inventory';
    this.schema = {
      id: { type: 'INT', primaryKey: true, autoIncrement: true },
      product_id: { type: 'INT', required: true, unique: true },
      current_stock: { type: 'INT', required: true, default: 0 },
      min_stock: { type: 'INT', required: true, default: 10 },
      max_stock: { type: 'INT', required: true, default: 100 },
      reorder_level: { type: 'INT', nullable: true },
      last_updated: { type: 'DATETIME', nullable: true },
      created_at: { type: 'DATETIME', default: 'CURRENT_TIMESTAMP' },
    };
  }

  /**
   * Validate inventory data before saving
   */
  validate(data) {
    const errors = [];

    if (!data.product_id) {
      errors.push('Product ID is required');
    }

    if (typeof data.current_stock !== 'number' || data.current_stock < 0) {
      errors.push('Current stock must be a non-negative number');
    }

    if (typeof data.min_stock !== 'number' || data.min_stock < 0) {
      errors.push('Minimum stock must be a non-negative number');
    }

    if (typeof data.max_stock !== 'number' || data.max_stock < 0) {
      errors.push('Maximum stock must be a non-negative number');
    }

    if (data.min_stock >= data.max_stock) {
      errors.push('Minimum stock must be less than maximum stock');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if inventory level is below minimum
   */
  isLowStock(currentStock, minStock) {
    return currentStock <= minStock;
  }

  /**
   * Check if inventory level exceeds maximum
   */
  isOverStock(currentStock, maxStock) {
    return currentStock >= maxStock;
  }

  /**
   * Calculate total inventory value
   */
  calculateInventoryValue(currentStock, unitCost) {
    if (!unitCost || unitCost < 0) return 0;
    return currentStock * unitCost;
  }

  /**
   * Get stock status
   */
  getStockStatus(currentStock, minStock, maxStock) {
    if (currentStock <= minStock) return 'LOW';
    if (currentStock >= maxStock) return 'OVERSTOCK';
    return 'NORMAL';
  }

  /**
   * Calculate reorder quantity
   */
  calculateReorderQuantity(currentStock, maxStock) {
    return Math.max(0, maxStock - currentStock);
  }
}

module.exports = Inventory;
