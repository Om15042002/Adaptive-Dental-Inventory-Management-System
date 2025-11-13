# Quick Copy-Paste Code Fixes

This document contains exact code replacements for completing schema compliance.

---

## 1. Suppliers.js - Complete Simplified Version

**File:** `Frontend/src/components/Suppliers/Suppliers.js`

**ACTION:** Replace the ENTIRE file content with this simplified, schema-compliant version:

```javascript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Email,
  Phone,
  Business
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { supplierService } from '../../services/dataService';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getAll();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setEditMode(true);
      setCurrentSupplier(supplier);
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone
      });
    } else {
      setEditMode(false);
      setCurrentSupplier(null);
      setFormData({
        name: '',
        email: '',
        phone: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let response;
      if (editMode) {
        response = await supplierService.update(currentSupplier.id, formData);
      } else {
        response = await supplierService.create(formData);
      }

      if (response.success) {
        toast.success(editMode ? 'Supplier updated successfully' : 'Supplier created successfully');
        handleCloseDialog();
        fetchSuppliers();
      }
    } catch (error) {
      toast.error(editMode ? 'Failed to update supplier' : 'Failed to create supplier');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await supplierService.delete(id);
        if (response.success) {
          toast.success('Supplier deleted successfully');
          fetchSuppliers();
        }
      } catch (error) {
        toast.error('Failed to delete supplier. It may have associated products.');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSuppliers = suppliers.length;
  const totalProducts = suppliers.reduce((sum, s) => sum + (s.product_count || 0), 0);
  const avgProductsPerSupplier = totalSuppliers > 0 ? (totalProducts / totalSuppliers).toFixed(1) : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Supplier Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Suppliers
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalSuppliers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Products Supplied
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Products per Supplier
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {avgProductsPerSupplier}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography fontWeight="medium">{supplier.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        {supplier.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        {supplier.phone}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {supplier.product_count || 0} products
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(supplier)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Supplier Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;
```

---

## 2. StockMovements.js - Movement Type Update

**File:** `Frontend/src/components/StockMovements/StockMovements.js`

### Find and Replace #1: Movement Types Array

**FIND THIS:**
```javascript
const movementTypes = [
  { value: 'IN', label: 'Stock In', color: 'success.main' },
  { value: 'OUT', label: 'Stock Out', color: 'error.main' },
  { value: 'ADJUST', label: 'Adjustment', color: 'warning.main' }
];
```

**REPLACE WITH:**
```javascript
const movementTypes = [
  { value: 'IN', label: 'Stock In', color: 'success.main' },
  { value: 'OUT', label: 'Stock Out', color: 'error.main' }
];
```

### Find and Replace #2: Statistics Cards

**FIND THIS SECTION (around line 200-250):**
```javascript
<Grid item xs={12} md={4}>
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        Total In
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="success.main">
        {stats.totalIn}
      </Typography>
    </CardContent>
  </Card>
</Grid>
<Grid item xs={12} md={4}>
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        Total Out
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="error.main">
        {stats.totalOut}
      </Typography>
    </CardContent>
  </Card>
</Grid>
<Grid item xs={12} md={4}>
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        Adjustments
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="warning.main">
        {stats.adjustments}
      </Typography>
    </CardContent>
  </Card>
</Grid>
```

**REPLACE WITH (remove third card):**
```javascript
<Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        Total In
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="success.main">
        {stats.totalIn}
      </Typography>
    </CardContent>
  </Card>
</Grid>
<Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        Total Out
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="error.main">
        {stats.totalOut}
      </Typography>
    </CardContent>
  </Card>
</Grid>
```

### Find and Replace #3: Statistics Calculation

**FIND THIS:**
```javascript
const stats = {
  totalIn: movements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
  totalOut: movements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
  adjustments: movements.filter(m => m.movement_type === 'ADJUST').reduce((sum, m) => sum + m.quantity, 0)
};
```

**REPLACE WITH:**
```javascript
const stats = {
  totalIn: movements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
  totalOut: movements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0)
};
```

### Find and Replace #4: Color Coding Logic

**FIND THIS:**
```javascript
const getMovementColor = (type) => {
  switch (type) {
    case 'IN':
      return 'success';
    case 'OUT':
      return 'error';
    case 'ADJUST':
      return 'warning';
    default:
      return 'default';
  }
};
```

**REPLACE WITH:**
```javascript
const getMovementColor = (type) => {
  return type === 'IN' ? 'success' : 'error';
};
```

---

## 3. Test the Updates

### Start Backend:
```bash
cd "c:\MAC Course\Sem 3\Internship Project 1\Adaptive Dental Inventory Management System\Backend\APIs"
npm start
```

### Start Frontend (in new terminal):
```bash
cd "c:\MAC Course\Sem 3\Internship Project 1\Adaptive Dental Inventory Management System\Frontend"
npm start
```

### Test Checklist:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Suppliers page:
  - [ ] Can create supplier with name, email, phone
  - [ ] Can edit supplier (only 3 fields shown)
  - [ ] Can delete supplier
  - [ ] Search works
- [ ] Stock Movements page:
  - [ ] Can record IN movement
  - [ ] Can record OUT movement
  - [ ] Only IN/OUT options in dropdown (no ADJUST)
  - [ ] Statistics show only 2 cards (Total In, Total Out)
- [ ] No console errors

---

## 4. Verification Commands

### Check for remaining non-compliant fields in frontend:

```bash
# In Frontend directory, search for these terms:
grep -r "contact_person" src/components/
grep -r "address" src/components/Suppliers/
grep -r "ADJUST" src/components/StockMovements/
grep -r "rating" src/components/Suppliers/
grep -r "status.*Active" src/components/Suppliers/
```

If any results appear, those files still need updating.

---

## Summary

1. **Copy-paste the entire Suppliers.js code** from section 1
2. **Update StockMovements.js** using the 4 find-replace operations in section 2
3. **Test thoroughly** using the checklist in section 3
4. **Verify** no remaining issues using commands in section 4

All backend work is complete. These are the final frontend updates needed for full schema compliance.
