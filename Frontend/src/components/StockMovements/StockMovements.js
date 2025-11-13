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
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  InputAdornment,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { stockMovementService, productService } from '../../services/dataService';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    product_id: ''
  });
  
  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'IN',
    quantity: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.type !== 'all') filterParams.type = filters.type;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      if (filters.product_id) filterParams.product_id = filters.product_id;

      const response = await stockMovementService.getAll(filterParams);
      if (response.success) {
        setMovements(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      product_id: '',
      movement_type: 'IN',
      quantity: '',
      reference: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await stockMovementService.create({
        ...formData,
        quantity: parseInt(formData.quantity)
      });

      if (response.success) {
        toast.success(response.message);
        fetchMovements();
        handleCloseDialog();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to record stock movement');
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN':
        return <TrendingUp color="success" />;
      case 'OUT':
        return <TrendingDown color="error" />;
      case 'ADJUST':
        return <SwapHoriz color="warning" />;
      default:
        return null;
    }
  };

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

  // Calculate statistics
  const stats = {
    totalIn: movements.filter(m => m.type === 'IN' || m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
    totalOut: movements.filter(m => m.type === 'OUT' || m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
    adjustments: movements.filter(m => m.type === 'ADJUST' || m.movement_type === 'ADJUST').length
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Stock Movements
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchMovements}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Record Movement
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Stock In
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.totalIn}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Stock Out
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.totalOut}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SwapHoriz sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Adjustments
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.adjustments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Movement Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="IN">Stock In</MenuItem>
                <MenuItem value="OUT">Stock Out</MenuItem>
                <MenuItem value="ADJUST">Adjustments</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Product"
                name="product_id"
                value={filters.product_id}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Products</MenuItem>
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<FilterList />} onClick={fetchMovements}>
              Apply Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell><strong>Reference</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>{movement.date || new Date().toISOString().split('T')[0]}</TableCell>
                    <TableCell>
                      <Typography fontWeight="600">
                        {movement.product_name || products.find(p => p.id === movement.product_id)?.name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getMovementIcon(movement.type || movement.movement_type)}
                        label={movement.type || movement.movement_type}
                        color={getMovementColor(movement.type || movement.movement_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="600" fontSize="1.1rem">
                        {movement.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>{movement.reference || '-'}</TableCell>
                    <TableCell>{movement.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Movement Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Record Stock Movement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Product"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Product</MenuItem>
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - {product.sku}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Movement Type"
                name="movement_type"
                value={formData.movement_type}
                onChange={handleChange}
                required
              >
                <MenuItem value="IN">Stock In</MenuItem>
                <MenuItem value="OUT">Stock Out</MenuItem>
                <MenuItem value="ADJUST">Adjustment</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="PO-2025-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Additional information..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Record Movement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockMovements;
