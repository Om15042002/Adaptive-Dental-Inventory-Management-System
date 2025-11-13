import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Avatar,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const getStockStatus = (currentStock, minStock, maxStock = null) => {
  const stockRatio = currentStock / Math.max(minStock, 1);
  
  if (currentStock === 0) {
    return { status: 'out', color: '#f44336', label: 'Out of Stock', severity: 'critical' };
  } else if (stockRatio < 0.5) {
    return { status: 'critical', color: '#ff5722', label: 'Critical Low', severity: 'critical' };
  } else if (stockRatio < 1) {
    return { status: 'low', color: '#ff9800', label: 'Low Stock', severity: 'warning' };
  } else if (stockRatio < 1.5) {
    return { status: 'adequate', color: '#2196f3', label: 'Adequate', severity: 'info' };
  } else {
    return { status: 'good', color: '#4caf50', label: 'Well Stocked', severity: 'success' };
  }
};

const getStockProgress = (currentStock, minStock, maxStock = null) => {
  if (maxStock && maxStock > minStock) {
    return Math.min((currentStock / maxStock) * 100, 100);
  }
  // If no max stock, use 200% of min stock as the target
  const target = minStock * 2;
  return Math.min((currentStock / target) * 100, 100);
};

function StockLevelCard({ item, index }) {
  const currentStock = item.current_stock || item.currentStock || 0;
  const minStock = item.min_stock || item.minStock || 0;
  const maxStock = item.max_stock || item.maxStock || null;
  
  const stockInfo = getStockStatus(currentStock, minStock, maxStock);
  const progressValue = getStockProgress(currentStock, minStock, maxStock);

  return (
    <Card
      sx={{
        height: '100%',
        border: `2px solid ${stockInfo.color}20`,
        borderLeft: `4px solid ${stockInfo.color}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          borderColor: `${stockInfo.color}40`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                mb: 0.5,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.product_name || item.productName || item.name || 'Unknown Product'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {item.category_name || item.categoryName || item.category || 'General'}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: `${stockInfo.color}20`,
              color: stockInfo.color,
            }}
          >
            {stockInfo.status === 'out' && <ErrorIcon />}
            {stockInfo.status === 'critical' && <WarningIcon />}
            {stockInfo.status === 'low' && <WarningIcon />}
            {stockInfo.status === 'adequate' && <TrendingIcon />}
            {stockInfo.status === 'good' && <CheckIcon />}
          </Avatar>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Stock Level
            </Typography>
            <Chip
              label={stockInfo.label}
              size="small"
              sx={{
                backgroundColor: `${stockInfo.color}20`,
                color: stockInfo.color,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          
          <Tooltip
            title={`Current: ${currentStock} | Min Required: ${minStock}${maxStock ? ` | Max: ${maxStock}` : ''}`}
            arrow
          >
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${stockInfo.color}10`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: stockInfo.color,
                  borderRadius: 4,
                },
              }}
            />
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: stockInfo.color,
                  mb: 0.5,
                }}
              >
                {currentStock.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                {minStock.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min Required
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {item.unit_price && (
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Total Value: 
              <strong style={{ marginLeft: 4, color: stockInfo.color }}>
                ${(currentStock * (item.unit_price || 0)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function EnhancedStockLevels({ stockItems = [], loading = false, title = "Stock Levels Overview" }) {
  // Sort items by criticality
  const sortedItems = [...stockItems].sort((a, b) => {
    const aStatus = getStockStatus(
      a.current_stock || a.currentStock || 0,
      a.min_stock || a.minStock || 0
    );
    const bStatus = getStockStatus(
      b.current_stock || b.currentStock || 0,
      b.min_stock || b.minStock || 0
    );
    
    const priorityMap = { out: 0, critical: 1, low: 2, adequate: 3, good: 4 };
    return priorityMap[aStatus.status] - priorityMap[bStatus.status];
  });

  // Get summary statistics
  const summary = stockItems.reduce(
    (acc, item) => {
      const status = getStockStatus(
        item.current_stock || item.currentStock || 0,
        item.min_stock || item.minStock || 0
      );
      
      acc[status.status] = (acc[status.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <Paper sx={{ p: 4, boxShadow: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
        
        {/* Summary chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {summary.out > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${summary.out} Out of Stock`}
              size="small"
              sx={{ backgroundColor: '#f4433620', color: '#f44336', fontWeight: 600 }}
            />
          )}
          {summary.critical > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${summary.critical} Critical`}
              size="small"
              sx={{ backgroundColor: '#ff572220', color: '#ff5722', fontWeight: 600 }}
            />
          )}
          {summary.low > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${summary.low} Low Stock`}
              size="small"
              sx={{ backgroundColor: '#ff980020', color: '#ff9800', fontWeight: 600 }}
            />
          )}
          {summary.adequate > 0 && (
            <Chip
              icon={<TrendingIcon />}
              label={`${summary.adequate} Adequate`}
              size="small"
              sx={{ backgroundColor: '#2196f320', color: '#2196f3', fontWeight: 600 }}
            />
          )}
          {summary.good > 0 && (
            <Chip
              icon={<CheckIcon />}
              label={`${summary.good} Well Stocked`}
              size="small"
              sx={{ backgroundColor: '#4caf5020', color: '#4caf50', fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {sortedItems.slice(0, 12).map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || item.product_id || index}>
            <StockLevelCard item={item} index={index} />
          </Grid>
        ))}
      </Grid>

      {sortedItems.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 200,
          color: 'text.secondary'
        }}>
          <InventoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Stock Items Found
          </Typography>
          <Typography variant="body2">
            Stock levels will appear here once data is available
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default EnhancedStockLevels;