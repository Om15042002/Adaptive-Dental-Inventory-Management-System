import * as XLSX from "xlsx";

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the exported file (without extension)
 * @param {String} sheetName - Name of the sheet in Excel
 */
export const exportToExcel = (
  data,
  filename = "export",
  sheetName = "Sheet1"
) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const maxWidth = 50;
    const minWidth = 10;
    const colWidths = [];

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      headers.forEach((header, i) => {
        let maxLen = header.length;
        data.forEach((row) => {
          const cellValue = String(row[header] || "");
          if (cellValue.length > maxLen) {
            maxLen = cellValue.length;
          }
        });
        colWidths.push({
          wch: Math.min(Math.max(maxLen + 2, minWidth), maxWidth),
        });
      });
      worksheet["!cols"] = colWidths;
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return false;
  }
};

/**
 * Export multiple sheets to a single Excel file
 * @param {Array} sheets - Array of {data, sheetName} objects
 * @param {String} filename - Name of the exported file
 */
export const exportMultipleSheets = (sheets, filename = "export") => {
  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ data, sheetName }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const colWidths = headers.map((header) => {
          let maxLen = header.length;
          data.forEach((row) => {
            const cellValue = String(row[header] || "");
            if (cellValue.length > maxLen) {
              maxLen = cellValue.length;
            }
          });
          return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
        });
        worksheet["!cols"] = colWidths;
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exporting multiple sheets:", error);
    return false;
  }
};

/**
 * Format product data for export
 */
export const formatProductsForExport = (products) => {
  return products.map((product) => ({
    "Product ID": product.id,
    "Product Name": product.name || product.product_name,
    Category: product.category_name || product.category || "N/A",
    Supplier: product.supplier_name || product.supplier || "N/A",
    "Unit Cost": `$${Number(
      product.unit_cost || product.unitPrice || 0
    ).toFixed(2)}`,
    "Current Stock": product.current_stock || product.currentStock || 0,
    "Min Stock": product.min_stock || product.minStockLevel || 0,
    "Max Stock": product.max_stock || product.maxStockLevel || 0,
    "Reorder Frequency":
      product.reorder_frequency || product.reorderFrequency || "N/A",
    SKU: product.sku || "N/A",
    Status: product.status || "Active",
  }));
};

/**
 * Format inventory data for export
 */
export const formatInventoryForExport = (inventory) => {
  return inventory.map((item) => ({
    "Product ID": item.product_id || item.id,
    "Product Name": item.product_name || item.name,
    Category: item.category_name || item.category || "N/A",
    "Current Stock": item.current_stock || item.currentStock || 0,
    "Min Stock": item.min_stock || item.minStockLevel || 0,
    "Max Stock": item.max_stock || item.maxStockLevel || 0,
    "Unit Cost": `$${Number(item.unit_cost || item.unitPrice || 0).toFixed(2)}`,
    "Total Value": `$${Number(
      (item.current_stock || 0) * (item.unit_cost || 0)
    ).toFixed(2)}`,
    "Stock Status": getStockStatusText(item),
    "Reorder Point": item.reorder_point || item.reorderPoint || 0,
  }));
};

/**
 * Format stock movements for export
 */
export const formatStockMovementsForExport = (movements) => {
  return movements.map((movement) => ({
    Date: new Date(movement.created_at || movement.date).toLocaleDateString(),
    Product: movement.product_name || "N/A",
    Type: movement.type === "in" ? "Stock In" : "Stock Out",
    Quantity: movement.quantity,
    Reference: movement.reference_number || movement.reference || "N/A",
    Notes: movement.notes || "N/A",
    "Unit Cost": movement.unit_cost
      ? `$${Number(movement.unit_cost).toFixed(2)}`
      : "N/A",
    "Performed By": movement.performed_by || movement.user_name || "N/A",
  }));
};

/**
 * Format reports data for export
 */
export const formatReportsForExport = (reportType, data) => {
  switch (reportType) {
    case "usage-trends":
      return data.map((item) => ({
        Product: item.product_name || item.name,
        Category: item.category_name || item.category,
        "Usage Count": item.usage_count || item.usageCount || 0,
        "Total Quantity": item.total_quantity || item.totalQuantity || 0,
        "Average Usage": item.average_usage || item.averageUsage || 0,
        Trend: item.trend || "Stable",
      }));

    case "cost-analysis":
      return data.map((item) => ({
        Product: item.product_name || item.name,
        "Unit Cost": `$${Number(item.unit_cost || item.unitPrice || 0).toFixed(
          2
        )}`,
        "Current Stock": item.current_stock || item.currentStock || 0,
        "Total Value": `$${Number(
          item.total_value || item.totalValue || 0
        ).toFixed(2)}`,
        "Cost Trend": item.cost_trend || "Stable",
        Category: item.category_name || item.category,
      }));

    case "reorder-recommendations":
      return data.map((item) => ({
        Product: item.product_name || item.name,
        "Current Stock": item.current_stock || item.currentStock || 0,
        "Min Stock": item.min_stock || item.minStockLevel || 0,
        "Reorder Point": item.reorder_point || item.reorderPoint || 0,
        "Suggested Order Qty":
          item.suggested_quantity || item.suggestedQuantity || 0,
        Priority: item.priority || "Medium",
        "Days Until Stockout":
          item.days_until_stockout || item.daysUntilStockout || "N/A",
      }));

    case "inventory-value":
      return data.map((item) => ({
        Category: item.category_name || item.category,
        "Product Count": item.product_count || item.productCount || 0,
        "Total Units": item.total_units || item.totalUnits || 0,
        "Total Value": `$${Number(
          item.total_value || item.totalValue || 0
        ).toFixed(2)}`,
        Percentage: `${Number(item.percentage || 0).toFixed(2)}%`,
      }));

    default:
      return data;
  }
};

/**
 * Helper function to get stock status text
 */
const getStockStatusText = (item) => {
  const currentStock = item.current_stock || item.currentStock || 0;
  const minStock = item.min_stock || item.minStockLevel || 0;
  const reorderPoint = item.reorder_point || item.reorderPoint || minStock;

  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minStock) return "Critical Low";
  if (currentStock <= reorderPoint) return "Low Stock";
  return "In Stock";
};
