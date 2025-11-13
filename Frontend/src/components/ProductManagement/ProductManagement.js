import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
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
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { productsAPI, categoriesAPI } from "../../services/api";
import { toast } from "react-toastify";
import ProductDetail from "./ProductDetail";
import {
  exportToExcel,
  formatProductsForExport,
} from "../../utils/excelExport";

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
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "detail"
  const [productForm, setProductForm] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    unitPrice: "",
    minStockLevel: "",
    maxStockLevel: "",
    reorderFrequency: "Monthly",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

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
  }, [page, itemsPerPage, searchTerm, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoryResponse = await categoriesAPI.getAll();
      const categoryData = categoryResponse.data || categoryResponse;
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        categoryId: product.category_id || "",
        supplierId: product.supplier_id || "",
        unitPrice: (product.unit_cost || 0).toString(),
        minStockLevel: (product.min_stock || 10).toString(),
        maxStockLevel: (product.max_stock || 100).toString(),
        reorderFrequency: product.reorder_frequency || "Monthly",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        categoryId: "",
        supplierId: "",
        unitPrice: "",
        minStockLevel: "",
        maxStockLevel: "",
        reorderFrequency: "Monthly",
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
        name: productForm.name,
        categoryId: productForm.categoryId || null,
        supplierId: productForm.supplierId || null,
        unitPrice: parseFloat(productForm.unitPrice) || 0,
        minStockLevel: parseInt(productForm.minStockLevel) || 10,
        maxStockLevel: parseInt(productForm.maxStockLevel) || 100,
        reorderFrequency: productForm.reorderFrequency || "Monthly",
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
      toast.error(error?.message || "Failed to save product");
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

  const toggleSelectProduct = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  };

  const selectAllVisible = () => {
    const visibleIds = paginatedProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // unselect visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected products?`)) return;
    try {
      await productsAPI.bulkDelete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} products`);
      clearSelection();
      fetchProducts();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete selected products");
    }
  };

  const handleExportSelected = () => {
    try {
      const dataToExport = products.filter((p) => selectedIds.includes(p.id));
      const formatted = formatProductsForExport(dataToExport);
      const success = exportToExcel(formatted, "Products_Selected", "Selected Products");
      if (success) {
        toast.success(`Exported ${formatted.length} selected products`);
      } else {
        toast.error("Failed to export selected products");
      }
    } catch (error) {
      console.error("Export selected error:", error);
      toast.error("Failed to export selected products");
    }
  };

  const handleBackToList = () => {
    setViewMode("cards");
    setSelectedProductId(null);
  };

  const handleExportProducts = () => {
    try {
      const filteredData =
        filteredProducts.length > 0 ? filteredProducts : products;
      const formattedData = formatProductsForExport(filteredData);
      const success = exportToExcel(formattedData, "Products", "Products Data");

      if (success) {
        toast.success(`Exported ${formattedData.length} products successfully`);
      } else {
        toast.error("Failed to export products");
      }
    } catch (error) {
      console.error("Error exporting products:", error);
      toast.error("Failed to export products");
    }
  };

  const getStockStatus = (product) => {
    const currentStock = product.current_stock || 0;
    const minStock = product.min_stock || 10;

    if (currentStock === 0) {
      return { status: "Out of Stock", color: "error" };
    } else if (currentStock <= minStock) {
      return { status: "Low Stock", color: "warning" };
    } else if (currentStock <= minStock * 1.5) {
      return { status: "Reorder Soon", color: "info" };
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
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
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
          {/* Select all visible */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={
                paginatedProducts.length > 0 &&
                paginatedProducts.every((p) => selectedIds.includes(p.id))
              }
              onChange={selectAllVisible}
              inputProps={{ "aria-label": "select all visible" }}
            />
            <Typography variant="body2" sx={{ mr: 1 }}>
              Select visible
            </Typography>
          </Box>
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
              onClick={handleExportProducts}
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

      {/* Bulk actions when items selected */}
      {selectedIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700 }}>{selectedIds.length} selected</Typography>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete}>
            Delete Selected
          </Button>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportSelected}>
            Export Selected
          </Button>
          <Button onClick={clearSelection}>Clear</Button>
        </Paper>
      )}

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
                  {/* Selection checkbox */}
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                    sx={{ position: "absolute", top: 8, left: 8, zIndex: 10, bgcolor: "rgba(255,255,255,0.8)", borderRadius: 1 }}
                  />
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
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
                    {product.name || "Unnamed Product"}
                  </Typography>

                  {/* Reorder Frequency */}
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
                    {product.reorder_frequency || "Monthly"}
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
                        ${Number(product.unit_cost || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <InventoryIcon
                        sx={{ fontSize: 16, mr: 0.5, color: "#666" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Stock: {product.current_stock || 0} (Min:{" "}
                        {product.min_stock || 10})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Supplier info if available */}
                  {product.supplier_name && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      Supplier: {product.supplier_name}
                    </Typography>
                  )}
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
