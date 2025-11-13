import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as InIcon,
  TrendingDown as OutIcon,
  SwapHoriz as TransferIcon,
  Add as AdjustmentIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const getTransactionIcon = (type) => {
  const iconMap = {
    'IN': InIcon,
    'OUT': OutIcon,
    'TRANSFER': TransferIcon,
    'ADJUSTMENT': AdjustmentIcon,
    'in': InIcon,
    'out': OutIcon,
    'transfer': TransferIcon,
    'adjustment': AdjustmentIcon,
  };
  
  const IconComponent = iconMap[type] || TransferIcon;
  return <IconComponent />;
};

const getTransactionColor = (type) => {
  const colorMap = {
    'IN': '#4caf50',
    'OUT': '#f44336',
    'TRANSFER': '#2196f3',
    'ADJUSTMENT': '#ff9800',
    'in': '#4caf50',
    'out': '#f44336',
    'transfer': '#2196f3',
    'adjustment': '#ff9800',
  };
  
  return colorMap[type] || '#757575';
};

const getTransactionLabel = (type) => {
  const labelMap = {
    'IN': 'Stock In',
    'OUT': 'Stock Out',
    'TRANSFER': 'Transfer',
    'ADJUSTMENT': 'Adjustment',
    'in': 'Stock In',
    'out': 'Stock Out',
    'transfer': 'Transfer',
    'adjustment': 'Adjustment',
  };
  
  return labelMap[type] || type;
};

const formatTimeAgo = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};

function RecentTransactions({ transactions = [], loading = false, error = null, onRefresh }) {
  if (loading) {
    return (
      <Paper sx={{ p: 4, height: 400, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Recent Transactions
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, height: 400, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Recent Transactions
        </Typography>
        <Alert 
          severity="error" 
          action={
            onRefresh && (
              <Box sx={{ ml: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={onRefresh}
                >
                  Retry
                </Typography>
              </Box>
            )
          }
        >
          Failed to load recent transactions
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, height: 400, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent Transactions
        </Typography>
        <Chip
          icon={<TimeIcon />}
          label={`${transactions.length} Recent`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {transactions.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 300,
          color: 'text.secondary'
        }}>
          <TransferIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Recent Transactions
          </Typography>
          <Typography variant="body2">
            Transaction history will appear here
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 320, overflow: 'auto' }}>
          <List sx={{ p: 0 }}>
            {transactions.map((transaction, index) => {
              const transactionType = transaction.movement_type || transaction.type || 'UNKNOWN';
              const color = getTransactionColor(transactionType);
              const isLastItem = index === transactions.length - 1;

              return (
                <React.Fragment key={transaction.id || index}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: `${color}20`,
                          color: color,
                        }}
                      >
                        {getTransactionIcon(transactionType)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                          >
                            {transaction.product_name || 
                             transaction.productName || 
                             transaction.product?.name || 
                             'Unknown Product'}
                          </Typography>
                          <Chip
                            label={getTransactionLabel(transactionType)}
                            size="small"
                            sx={{
                              backgroundColor: `${color}20`,
                              color: color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: 
                              <strong style={{ color: color, marginLeft: 4 }}>
                                {Math.abs(transaction.quantity_changed || transaction.quantity || 0)}
                              </strong>
                            </Typography>
                            {transaction.reason && (
                              <Typography variant="body2" color="text.secondary">
                                • {transaction.reason}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {formatTimeAgo(transaction.created_at || transaction.timestamp || transaction.date)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {!isLastItem && <Divider variant="inset" sx={{ ml: 6 }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      )}
    </Paper>
  );
}

export default RecentTransactions;