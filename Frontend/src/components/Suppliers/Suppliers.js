import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Visibility as ViewIcon,
  CalendarToday as DateIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { suppliersAPI } from "../../services/api";
import { toast } from "react-toastify";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    products_supplied: "",
    payment_terms: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      const suppliersData = response.data || response;
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name || "",
        contact_person: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zip_code: supplier.zip_code || "",
        country: supplier.country || "",
        products_supplied: supplier.products_supplied || "",
        payment_terms: supplier.payment_terms || "",
        is_active: supplier.is_active !== false,
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        products_supplied: "",
        payment_terms: "",
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleOpenViewDialog = (supplier) => {
    setViewSupplier(supplier);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in required fields (Name and Phone)");
      return;
    }

    try {
      if (selectedSupplier) {
        await suppliersAPI.update(selectedSupplier.id, formData);
        toast.success("Supplier updated successfully");
      } else {
        await suppliersAPI.create(formData);
        toast.success("Supplier added successfully");
      }
      handleCloseDialog();
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(error?.message || "Failed to save supplier");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await suppliersAPI.delete(id);
        toast.success("Supplier deleted successfully");
        fetchSuppliers();
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast.error("Failed to delete supplier");
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const name = supplier.name || "";
    const email = supplier.email || "";
    const phone = supplier.phone || "";
    const city = supplier.city || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Suppliers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 2, backgroundColor: "#ffffff" }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, phone, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Suppliers Grid */}
      <Grid container spacing={3}>
        {filteredSuppliers.map((supplier) => (
          <Grid item xs={12} md={6} lg={4} key={supplier.id}>
            <Card
              sx={{
                height: "100%",
                boxShadow: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header with Avatar and Actions */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 56,
                        height: 56,
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {supplier.name}
                      </Typography>
                      <Chip
                        icon={
                          supplier.is_active ? <ActiveIcon /> : <InactiveIcon />
                        }
                        label={supplier.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={supplier.is_active ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(supplier)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Information */}
                <List dense disablePadding>
                  {supplier.contact_person && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText
                        primary="Contact Person"
                        secondary={supplier.contact_person}
                        primaryTypographyProps={{
                          variant: "caption",
                          color: "text.secondary",
                        }}
                        secondaryTypographyProps={{
                          variant: "body2",
                          color: "text.primary",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  )}

                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <PhoneIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <ListItemText
                      primary={supplier.phone || "N/A"}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>

                  {supplier.email && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <EmailIcon
                        sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                      />
                      <ListItemText
                        primary={supplier.email}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  )}

                  {(supplier.city || supplier.state || supplier.country) && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <LocationIcon
                        sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                      />
                      <ListItemText
                        primary={
                          [supplier.city, supplier.state, supplier.country]
                            .filter(Boolean)
                            .join(", ") || "N/A"
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  )}

                  {supplier.products_supplied && (
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <CategoryIcon
                        sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                      />
                      <ListItemText
                        primary={supplier.products_supplied}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  )}
                </List>

                {supplier.payment_terms && (
                  <Box
                    sx={{ mt: 2, p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Payment Terms
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    >
                      {supplier.payment_terms}
                    </Typography>
                  </Box>
                )}

                {/* View Details Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={() => handleOpenViewDialog(supplier)}
                  sx={{ mt: 2 }}
                >
                  View Full Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredSuppliers.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No suppliers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Click 'Add Supplier' to create your first supplier"}
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSupplier ? "Edit Supplier" : "Add New Supplier"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Products Supplied"
                name="products_supplied"
                value={formData.products_supplied}
                onChange={handleInputChange}
                placeholder="e.g., Dental tools, Anesthetics, Consumables"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleInputChange}
                placeholder="e.g., Net 30 days, COD"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSupplier ? "Update" : "Add"} Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supplier Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <BusinessIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {viewSupplier?.name}
              </Typography>
              <Chip
                icon={
                  viewSupplier?.is_active ? <ActiveIcon /> : <InactiveIcon />
                }
                label={
                  viewSupplier?.is_active
                    ? "Active Supplier"
                    : "Inactive Supplier"
                }
                size="small"
                color={viewSupplier?.is_active ? "success" : "default"}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Contact Information Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonIcon /> Contact Information
              </Typography>
              <Grid container spacing={2}>
                {viewSupplier?.contact_person && (
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <PersonIcon sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contact Person
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewSupplier.contact_person}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PhoneIcon sx={{ color: "text.secondary" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier?.phone || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {viewSupplier?.email && (
                  <Grid item xs={12}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <EmailIcon sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {viewSupplier.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Address Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocationIcon /> Address Details
              </Typography>
              <Grid container spacing={2}>
                {viewSupplier?.address && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Street Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier.address}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {viewSupplier?.city && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier.city}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {viewSupplier?.state && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        State/Province
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier.state}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {viewSupplier?.zip_code && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ZIP Code
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier.zip_code}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {viewSupplier?.country && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Country
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {viewSupplier.country}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {!viewSupplier?.address &&
                  !viewSupplier?.city &&
                  !viewSupplier?.state && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No address information available
                      </Typography>
                    </Grid>
                  )}
              </Grid>
            </Paper>

            {/* Products & Services Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CategoryIcon /> Products & Services
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Products Supplied
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {viewSupplier?.products_supplied ||
                    "No products information available"}
                </Typography>
              </Box>
            </Paper>

            {/* Payment & Terms Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PaymentIcon /> Payment Terms
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Terms & Conditions
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {viewSupplier?.payment_terms || "No payment terms specified"}
                </Typography>
              </Box>
            </Paper>

            {/* Additional Information */}
            <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <DescriptionIcon /> Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Supplier ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      #{viewSupplier?.id}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {viewSupplier?.is_active ? "Active" : "Inactive"}
                    </Typography>
                  </Box>
                </Grid>
                {viewSupplier?.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DateIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Added On
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(
                            viewSupplier.created_at
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {viewSupplier?.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DateIcon
                        sx={{ color: "text.secondary", fontSize: 20 }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(
                            viewSupplier.updated_at
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewSupplier);
            }}
          >
            Edit Supplier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Suppliers;
