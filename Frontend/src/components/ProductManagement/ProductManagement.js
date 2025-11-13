import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { productsAPI, categoriesAPI } from "../../services/api";
import { toast } from "react-toastify";
import ProductDetail from "./ProductDetail";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "detail"
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    supplierId: "",
    unitPrice: "",
    minStockLevel: "",
    maxStockLevel: "",
    reorderPoint: "",
    unit: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch products from API
      const productResponse = await productsAPI.getAll({
        page: page,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
      });

      const productData = productResponse.data || productResponse;
      setProducts(
        Array.isArray(productData) ? productData : productData.products || []
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories from API
      const categoryResponse = await categoriesAPI.getAll();
      const categoryData = categoryResponse.data || categoryResponse;
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        sku: product.sku,
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        unitPrice: product.unitPrice.toString(),
        minStockLevel: product.minStockLevel.toString(),
        maxStockLevel: product.maxStockLevel.toString(),
        reorderPoint: product.reorderPoint.toString(),
        unit: product.unit,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        sku: "",
        categoryId: "",
        supplierId: "",
        unitPrice: "",
        minStockLevel: "",
        maxStockLevel: "",
        reorderPoint: "",
        unit: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        unitPrice: parseFloat(productForm.unitPrice),
        minStockLevel: parseInt(productForm.minStockLevel),
        maxStockLevel: parseInt(productForm.maxStockLevel),
        reorderPoint: parseInt(productForm.reorderPoint),
      };

      if (editingProduct) {
        // Update existing product
        await productsAPI.update(editingProduct.id, productData);
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await productsAPI.create(productData);
        toast.success("Product created successfully");
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.delete(id);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("cards");
    setSelectedProductId(null);
  };

  const getStockStatus = (product) => {
    const currentStock = product.current_stock || product.currentStock || 0;
    const reorderPoint =
      product.reorder_point || product.reorderPoint || product.min_stock || 0;

    if (currentStock <= reorderPoint) {
      return { status: "Low Stock", color: "error" };
    } else if (currentStock <= reorderPoint * 1.5) {
      return { status: "Reorder Soon", color: "warning" };
    } else {
      return { status: "In Stock", color: "success" };
    }
  };

  const getProductImage = (productId) => {
    // Check localStorage for saved image
    const savedImage = localStorage.getItem(`product_image_${productId}`);
    return savedImage || null;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.category === selectedCategory ||
      product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // If viewing product detail, render ProductDetail component
  if (viewMode === "detail" && selectedProductId) {
    return (
      <ProductDetail productId={selectedProductId} onBack={handleBackToList} />
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}
          >
            Product Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your dental inventory products
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  borderRadius: 1.5,
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.name || category.category_name}
                  >
                    {category.name || category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ExportIcon />}
              sx={{
                py: 1.75,
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Export Products
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {paginatedProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const productImage = getProductImage(product.id);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                  },
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Product Image */}
                <Box
                  sx={{
                    height: 200,
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.product_name || product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  )}

                  {/* Stock Status Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Chip
                      label={stockStatus.status}
                      size="small"
                      color={stockStatus.color}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1.5,
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Product Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: "1.1rem",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.product_name || product.name || "Unnamed Product"}
                  </Typography>

                  {/* SKU */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      backgroundColor: "#f5f5f5",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      display: "inline-block",
                      mb: 1,
                    }}
                  >
                    SKU: {product.sku || "N/A"}
                  </Typography>

                  {/* Category */}
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={
                        product.category_name ||
                        product.category ||
                        "Uncategorized"
                      }
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 1.5 }}
                    />
                  </Box>

                  {/* Price and Stock */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <MoneyIcon
                        sx={{ fontSize: 16, mr: 0.5, color: "#4caf50" }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#4caf50" }}
                      >
                        $
                        {Number(
                          product.unit_cost || product.unitPrice || 0
                        ).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <InventoryIcon
                        sx={{ fontSize: 16, mr: 0.5, color: "#666" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {product.current_stock || product.currentStock || 0}{" "}
                        {product.unit || "units"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 40,
                    }}
                  >
                    {product.description || "No description available"}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewProduct(product.id)}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      flex: 1,
                    }}
                  >
                    View Details
                  </Button>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => handleOpenDialog(product)}
                      size="small"
                      sx={{
                        color: "#1976d2",
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteProduct(product.id)}
                      size="small"
                      sx={{
                        color: "#d32f2f",
                        "&:hover": {
                          backgroundColor: "#ffebee",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* No Products Message */}
      {paginatedProducts.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            mt: 3,
          }}
        >
          <CategoryIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || selectedCategory
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first product"}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 1.5,
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}

      {/* Product Dialog - keeping the existing dialog code */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku}
                onChange={(e) =>
                  setProductForm({ ...productForm, sku: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
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
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name || category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit"
                value={productForm.unit}
                onChange={(e) =>
                  setProductForm({ ...productForm, unit: e.target.value })
                }
                placeholder="e.g., pieces, boxes, tubes"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level"
                type="number"
                value={productForm.minStockLevel}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    minStockLevel: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Stock Level"
                type="number"
                value={productForm.maxStockLevel}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    maxStockLevel: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={productForm.reorderPoint}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    reorderPoint: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
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
            {editingProduct ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManagement;
