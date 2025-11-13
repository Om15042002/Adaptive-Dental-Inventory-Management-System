import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Camera as CameraIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
} from "recharts";
import { productsAPI, categoriesAPI } from "../../services/api";
import { toast } from "react-toastify";

// Sample usage data for demonstration
const sampleUsageData = [
  { month: "Jan", usage: 45, received: 100, cost: 2250 },
  { month: "Feb", usage: 52, received: 0, cost: 2600 },
  { month: "Mar", usage: 48, received: 150, cost: 2400 },
  { month: "Apr", usage: 55, received: 0, cost: 2750 },
  { month: "May", usage: 58, received: 100, cost: 2900 },
  { month: "Jun", usage: 62, received: 0, cost: 3100 },
  { month: "Jul", usage: 45, received: 200, cost: 2250 },
  { month: "Aug", usage: 51, received: 0, cost: 2550 },
  { month: "Sep", usage: 47, received: 0, cost: 2350 },
  { month: "Oct", usage: 53, received: 100, cost: 2650 },
];

function ProductDetail({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const usageData = sampleUsageData; // Static sample data for usage chart
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImage, setProductImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    unitPrice: "",
    minStockLevel: "",
    maxStockLevel: "",
    reorderFrequency: "Monthly",
  });

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching product with ID:", productId);

      const response = await productsAPI.getById(productId);
      console.log("API Response:", response);

      // The API interceptor already extracts response.data,
      // so response is the formatted response object { data: {...}, success: true, ... }
      const productData = response.data || response;
      console.log("Product Data:", productData);

      setProduct(productData);

      // Load saved image from localStorage (in real app, this would be from server)
      const savedImage = localStorage.getItem(`product_image_${productId}`);
      if (savedImage) {
        setProductImage(savedImage);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoryResponse = await categoriesAPI.getAll();
      const categoryData = categoryResponse.data || categoryResponse;
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchStockHistory = useCallback(async () => {
    try {
      // For now, use sample data as the stock movements API might need product filtering
      const sampleHistory = [
        {
          id: 1,
          type: "in",
          quantity: 100,
          date: "2024-10-01",
          reference: "PO-2024-001",
          notes: "Initial stock received from supplier",
          unitCost: 50,
        },
        {
          id: 2,
          type: "out",
          quantity: -25,
          date: "2024-10-05",
          reference: "USAGE-001",
          notes: "Used in dental procedure - Room 3",
          unitCost: 50,
        },
        {
          id: 3,
          type: "out",
          quantity: -15,
          date: "2024-10-08",
          reference: "USAGE-002",
          notes: "Used in dental procedure - Room 1",
          unitCost: 50,
        },
        {
          id: 4,
          type: "in",
          quantity: 50,
          date: "2024-10-10",
          reference: "PO-2024-002",
          notes: "Restock order",
          unitCost: 48,
        },
      ];
      setStockHistory(sampleHistory);
    } catch (error) {
      console.error("Error fetching stock history:", error);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchStockHistory();
      fetchCategories();
    }
  }, [productId, fetchProductDetails, fetchStockHistory, fetchCategories]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setProductImage(imageData);
        // Save to localStorage (in real app, upload to server)
        localStorage.setItem(`product_image_${productId}`, imageData);
        toast.success("Product image updated successfully");
        setOpenImageDialog(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    localStorage.removeItem(`product_image_${productId}`);
    toast.success("Product image removed successfully");
    setOpenImageDialog(false);
  };

  const handleOpenEditDialog = () => {
    setProductForm({
      name: product.name || "",
      categoryId: product.category_id || "",
      supplierId: product.supplier_id || "",
      unitPrice: (product.unit_cost || 0).toString(),
      minStockLevel: (product.min_stock || 10).toString(),
      maxStockLevel: (product.max_stock || 100).toString(),
      reorderFrequency: product.reorder_frequency || "Monthly",
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: productForm.name,
        categoryId: productForm.categoryId || null,
        supplierId: productForm.supplierId || null,
        unitPrice: parseFloat(productForm.unitPrice) || 0,
        minStockLevel: parseInt(productForm.minStockLevel) || 10,
        maxStockLevel: parseInt(productForm.maxStockLevel) || 100,
        reorderFrequency: productForm.reorderFrequency || "Monthly",
      };

      await productsAPI.update(productId, productData);
      toast.success("Product updated successfully");
      handleCloseEditDialog();
      fetchProductDetails(); // Refresh product data
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error?.message || "Failed to update product");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "discontinued":
        return "warning";
      default:
        return "default";
    }
  };

  const getStockStatus = () => {
    if (!product) return { status: "unknown", color: "default" };

    const currentStock = product.current_stock || product.currentStock || 0;
    const minStock = product.min_stock || product.minStockLevel || 0;
    const reorderPoint = product.reorder_point || product.reorderPoint || 0;

    if (currentStock <= reorderPoint) {
      return { status: "Critical", color: "error" };
    } else if (currentStock <= minStock) {
      return { status: "Low", color: "warning" };
    } else {
      return { status: "Good", color: "success" };
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <Typography>Loading product details...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}
          >
            {product.product_name || product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            SKU: {product.sku} | Category:{" "}
            {product.category_name || product.category}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenEditDialog}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            },
          }}
        >
          Edit Product
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Product Image and Basic Info */}
        <Grid item xs={12} lg={4}>
          {/* Product Image */}
          <Card
            sx={{
              mb: 2.5,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 260,
                  maxHeight: 260,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {productImage ? (
                  <Box
                    component="img"
                    src={productImage}
                    alt={product.product_name || product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", color: "#999" }}>
                    <CameraIcon sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="body2">No image uploaded</Typography>
                  </Box>
                )}

                {/* Upload button overlay */}
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,1)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setOpenImageDialog(true)}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => setOpenImageDialog(true)}
                  sx={{
                    flex: 1,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {productImage ? "Change" : "Upload"}
                </Button>
                {productImage && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveImage}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Quick Stats
              </Typography>

              <List dense sx={{ py: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <InventoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Current Stock"
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {product.current_stock || product.currentStock || 0}{" "}
                          {product.unit || "units"}
                        </Typography>
                        <Chip
                          label={stockStatus.status}
                          size="small"
                          color={stockStatus.color}
                          sx={{ borderRadius: 1.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MoneyIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Unit Price"
                    secondary={
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        $
                        {Number(
                          product.unit_cost || product.unitPrice || 0
                        ).toFixed(2)}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Reorder Point"
                    secondary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.reorder_point || product.reorderPoint || 0}{" "}
                        units
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color={getStatusColor(product.status)} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={
                          (product.status || "active").charAt(0).toUpperCase() +
                          (product.status || "active").slice(1)
                        }
                        size="small"
                        color={getStatusColor(product.status)}
                        sx={{ borderRadius: 1.5 }}
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Detailed Information */}
        <Grid item xs={12} lg={8}>
          {/* Product Details */}
          <Card
            sx={{
              mb: 2.5,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Product Information
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.description || "No description available"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Category
                  </Typography>
                  <Chip
                    icon={<CategoryIcon />}
                    label={
                      product.category_name ||
                      product.category ||
                      "Uncategorized"
                    }
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2, borderRadius: 1.5 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Supplier
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.supplier_name || "Not specified"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Unit of Measurement
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.unit || "units"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Minimum Stock
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {product.min_stock || product.minStockLevel || 0} units
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Maximum Stock
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {product.max_stock || product.maxStockLevel || 0} units
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(
                      product.updated_at || product.updatedAt || Date.now()
                    ).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Usage Trends (Last 10 Months)
                </Typography>
              </Box>

              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "usage") return [value, "Units Used"];
                        if (name === "received")
                          return [value, "Units Received"];
                        if (name === "cost") return [`$${value}`, "Cost"];
                        return [value, name];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                      name="usage"
                    />
                    <Line
                      type="monotone"
                      dataKey="received"
                      stroke="#4caf50"
                      strokeWidth={2}
                      name="received"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Stock Movement History */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Stock Movement History
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Unit Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockHistory.map((movement) => (
                      <TableRow key={movement.id} hover>
                        <TableCell>
                          {new Date(movement.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              movement.type === "in" ? "Stock In" : "Stock Out"
                            }
                            size="small"
                            color={movement.type === "in" ? "success" : "error"}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color:
                                movement.type === "in" ? "#4caf50" : "#f44336",
                            }}
                          >
                            {movement.type === "in" ? "+" : ""}
                            {movement.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>
                          {movement.reference}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ maxWidth: 200 }}
                            noWrap
                          >
                            {movement.notes}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${movement.unitCost.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Upload Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Product Image</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", p: 3 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCameraIcon />}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 2,
                  px: 4,
                }}
              >
                Choose Image
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenImageDialog(false)}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem", pb: 1 }}>
          Edit Product
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.categoryId}
                  label="Category"
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      categoryId: e.target.value,
                    })
                  }
                  sx={{
                    borderRadius: 1.5,
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name || category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Reorder Frequency</InputLabel>
                <Select
                  value={productForm.reorderFrequency}
                  label="Reorder Frequency"
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      reorderFrequency: e.target.value,
                    })
                  }
                  sx={{
                    borderRadius: 1.5,
                  }}
                >
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="One-Time">One-Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={productForm.unitPrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, unitPrice: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={productForm.minStockLevel}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    minStockLevel: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Stock"
                type="number"
                value={productForm.maxStockLevel}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    maxStockLevel: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductDetail;
