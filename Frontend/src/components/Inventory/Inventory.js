import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { inventoryAPI, stockMovementsAPI } from "../../services/api";
import { toast } from "react-toastify";

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockChange, setStockChange] = useState("");
  const [changeReason, setChangeReason] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, selectedCategory, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      // Fetch inventory data from API
      const inventoryResponse = await inventoryAPI.getAll({
        search: searchTerm,
        category: selectedCategory,
        stockStatus: stockFilter,
      });

      const inventoryData = inventoryResponse.data || inventoryResponse;
      setInventoryItems(
        Array.isArray(inventoryData)
          ? inventoryData
          : inventoryData.inventory || []
      );
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item) => {
    const currentStock = item.current_stock || item.currentStock || 0;
    const minStock = item.min_stock || item.minStockLevel || 0;
    const reorderPoint = item.reorder_point || item.reorderPoint || minStock;

    if (currentStock === 0)
      return { status: "Out of Stock", color: "error", severity: "critical" };
    if (currentStock <= minStock)
      return { status: "Critical Low", color: "error", severity: "critical" };
    if (currentStock <= reorderPoint)
      return { status: "Low Stock", color: "warning", severity: "warning" };
    return { status: "In Stock", color: "success", severity: "normal" };
  };

  const getStockPercentage = (item) => {
    const currentStock = item.current_stock || item.currentStock || 0;
    const maxStock = item.max_stock || item.maxStockLevel || 100;
    return Math.min((currentStock / maxStock) * 100, 100);
  };

  const handleOpenStockDialog = (item) => {
    setSelectedItem(item);
    setStockChange("");
    setChangeReason("");
    setOpenStockDialog(true);
  };

  const handleStockUpdate = async () => {
    if (!stockChange || !changeReason) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const changeValue = parseInt(stockChange);
      const newStock = selectedItem.currentStock + changeValue;

      if (newStock < 0) {
        toast.error("Cannot reduce stock below zero");
        return;
      }

      // Update stock
      await inventoryAPI.updateStock(selectedItem.id, {
        quantity: changeValue,
        reason: changeReason,
        type: changeValue > 0 ? "in" : "out",
      });

      // Create stock movement record
      await stockMovementsAPI.create({
        productId: selectedItem.productId,
        type: changeValue > 0 ? "in" : "out",
        quantity: Math.abs(changeValue),
        reason: changeReason,
        userId: 1, // Current user ID
      });

      toast.success("Stock updated successfully");
      setOpenStockDialog(false);
      fetchInventory();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const productName = item.product_name || item.productName || "";
    const sku = item.sku || "";
    const category = item.category_name || item.category || "";
    const currentStock = item.current_stock || item.currentStock || 0;
    const minStock = item.min_stock || item.minStockLevel || 0;
    const reorderPoint = item.reorder_point || item.reorderPoint || minStock;

    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sku && sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || category === selectedCategory;

    let matchesStockFilter = true;
    if (stockFilter === "low") {
      matchesStockFilter = currentStock <= reorderPoint;
    } else if (stockFilter === "critical") {
      matchesStockFilter = currentStock <= minStock;
    } else if (stockFilter === "out") {
      matchesStockFilter = currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const categories = [
    ...new Set(
      inventoryItems
        .map((item) => item.category_name || item.category)
        .filter(Boolean)
    ),
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
        Inventory Management
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2, backgroundColor: "#ffffff" }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ backgroundColor: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel sx={{ backgroundColor: "#fff", px: 1 }}>
                Category
              </InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiSelect-select": {
                    py: 1.5,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      "& .MuiMenuItem-root": {
                        py: 1.5,
                        fontSize: "0.95rem",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth>
              <InputLabel sx={{ backgroundColor: "#fff", px: 1 }}>
                Stock Status
              </InputLabel>
              <Select
                value={stockFilter}
                label="Stock Status"
                onChange={(e) => setStockFilter(e.target.value)}
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiSelect-select": {
                    py: 1.5,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      "& .MuiMenuItem-root": {
                        py: 1.5,
                        fontSize: "0.95rem",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">All Items</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="critical">Critical Low</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<HistoryIcon />}
              sx={{
                py: 1.5,
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              History
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Items */}
      <Grid container spacing={4}>
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item);
          const stockPercentage = getStockPercentage(item);
          const productName =
            item.product_name || item.productName || "Unknown Product";
          const sku = item.sku || "N/A";
          const category =
            item.category_name || item.category || "Uncategorized";
          const currentStock = item.current_stock || item.currentStock || 0;
          const minStock = item.min_stock || item.minStockLevel || 0;
          const maxStock = item.max_stock || item.maxStockLevel || 100;
          const unitCost = item.unit_cost || item.unitCost || 0;
          const lastUpdated = item.last_updated
            ? new Date(item.last_updated).toLocaleDateString()
            : "N/A";

          return (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  position: "relative",
                  boxShadow: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {stockStatus.severity === "critical" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                  >
                    <WarningIcon color="error" sx={{ fontSize: 28 }} />
                  </Box>
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {productName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    SKU: {sku}
                  </Typography>
                  <Chip
                    label={category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Current Stock
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentStock} units
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stockPercentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            stockStatus.severity === "critical"
                              ? "#f44336"
                              : stockStatus.severity === "warning"
                              ? "#ff9800"
                              : "#4caf50",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        Min: {minStock}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        Max: {maxStock}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={stockStatus.status}
                    size="small"
                    color={stockStatus.color}
                    sx={{ mb: 2.5 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 0.5 }}
                  >
                    Last Updated: {lastUpdated}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5 }}
                  >
                    Unit Cost: ${unitCost}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenStockDialog(item)}
                    >
                      Adjust Stock
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                    >
                      History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredItems.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No inventory items found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      )}

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={openStockDialog}
        onClose={() => setOpenStockDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Adjust Stock -{" "}
          {selectedItem?.product_name || selectedItem?.productName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Stock:{" "}
              {selectedItem?.current_stock || selectedItem?.currentStock || 0}{" "}
              units
            </Typography>
            <TextField
              fullWidth
              label="Stock Change"
              type="number"
              value={stockChange}
              onChange={(e) => setStockChange(e.target.value)}
              placeholder="Enter positive number to add, negative to remove"
              sx={{ mb: 2 }}
              helperText="Use positive numbers to add stock, negative to remove"
            />
            <TextField
              fullWidth
              label="Reason for Change"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., New delivery, Used in treatment, Damaged items"
              required
            />
            {stockChange && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                New Stock Level:{" "}
                {(selectedItem?.current_stock ||
                  selectedItem?.currentStock ||
                  0) + parseInt(stockChange || 0)}{" "}
                units
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>Cancel</Button>
          <Button onClick={handleStockUpdate} variant="contained">
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventory;
