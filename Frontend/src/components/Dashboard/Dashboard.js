import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { reportsAPI, inventoryAPI } from "../../services/api";
import { toast } from "react-toastify";

function StatCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "visible",
        boxShadow: 2,
        borderLeft: `4px solid ${color}`,
        background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 8px 25px ${color}30`,
          borderLeftWidth: "6px",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: "0.9rem", sm: "1rem" },
                color: "text.primary",
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8rem", lineHeight: 1.3 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "12px",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: { xs: 44, sm: 50 },
              height: { xs: 44, sm: 50 },
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                color, 
                fontSize: { xs: 24, sm: 28 } 
              } 
            })}
          </Box>
        </Box>
        
        <Box sx={{ mb: trend ? 1 : 0 }}>
          <Typography
            variant="h3"
            component="div"
            sx={{ 
              fontWeight: "bold", 
              color: color,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
        </Box>

        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Chip
              label={trend.label}
              size="small"
              sx={{
                backgroundColor: trend.positive ? "#4caf5020" : "#f4433620",
                color: trend.positive ? "#4caf50" : "#f44336",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  console.log('📊 Dashboard component rendering...');
  console.log('🔑 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
  console.log('👤 User in localStorage:', localStorage.getItem('user') ? 'EXISTS' : 'MISSING');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    console.log('🎯 Dashboard useEffect - fetching data...');
    fetchDashboardData();
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      // Mock data for recent transactions since API might not be ready
      const mockTransactions = [
        {
          id: 1,
          product_name: "Dental Floss Premium",
          movement_type: "OUT",
          quantity: -5,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          reason: "Patient treatment"
        },
        {
          id: 2,
          product_name: "Amalgam Filling",
          movement_type: "IN",
          quantity: 20,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          reason: "Supplier delivery"
        },
        {
          id: 3,
          product_name: "Disposable Gloves",
          movement_type: "OUT",
          quantity: -10,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          reason: "Daily usage"
        }
      ];
      
      setRecentTransactions(mockTransactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      setTransactionsError("Failed to load recent transactions");
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLastRefresh(new Date());
    await Promise.all([
      fetchDashboardData(),
      fetchRecentTransactions(),
    ]);
    toast.success("Dashboard data refreshed");
  }, [fetchRecentTransactions]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats and inventory data
      const [dashboardResponse, inventoryResponse] = await Promise.all([
        inventoryAPI.getDashboardStats(),
        inventoryAPI.getLowStock(),
      ]);

      // Handle nested data structure
      const dashboardStats =
        dashboardResponse.data?.data ||
        dashboardResponse.data ||
        dashboardResponse;
      const inventoryData =
        inventoryResponse.data?.data ||
        inventoryResponse.data ||
        inventoryResponse;

      console.log("Dashboard stats received:", dashboardStats);
      console.log("Inventory data received:", inventoryData);

      setDashboardData(dashboardStats);

      // Filter low stock items from inventory
      const lowStock = Array.isArray(inventoryData)
        ? inventoryData
            .filter((item) => {
              const currentStock = item.current_stock || item.currentStock || 0;
              const minStock = item.min_stock || item.minStock || 0;
              return currentStock <= minStock;
            })
            .slice(0, 5) // Show only top 5
        : [];

      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Skeleton loading component
  const SkeletonStatCard = () => (
    <Card sx={{ height: "100%", p: { xs: 2, sm: 3 } }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={120} height={24} />
        </Box>
        <Skeleton variant="text" width={80} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={150} height={20} />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Skeleton variant="text" width={200} height={48} />
          <Skeleton variant="rectangular" width={120} height={32} />
        </Box>
        
        {/* Skeleton Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, md: 5 } }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <SkeletonStatCard />
            </Grid>
          ))}
        </Grid>

        {/* Skeleton Charts */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, height: 450 }}>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" width="100%" height={350} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 450 }}>
              <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2 
      }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading || transactionsLoading}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, md: 5 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={dashboardData?.totalProducts?.toLocaleString() || "0"}
            icon={<InventoryIcon />}
            color="#1976d2"
            subtitle="Active items in inventory"
            trend={{ 
              label: "+12 new items", 
              positive: true 
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Alerts"
            value={dashboardData?.lowStockItems || "0"}
            icon={<WarningIcon />}
            color="#ff9800"
            subtitle="Items need reordering"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`$${Number(
              dashboardData?.totalInventoryValue || 0
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<MoneyIcon />}
            color="#4caf50"
            subtitle="Current inventory value"
            trend={{ 
              label: "+8.5% this month", 
              positive: true 
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={dashboardData?.totalCategories || "0"}
            icon={<TrendingUpIcon />}
            color="#9c27b0"
            subtitle="Product categories"
          />
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Inventory by Category Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            height: { xs: 350, md: 450 }, 
            boxShadow: 2 
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={
                  dashboardData?.categoryBreakdown?.map((cat) => ({
                    name: cat.name,
                    value: parseInt(cat.product_count || 0),
                  })) || []
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Stock Status Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            height: { xs: 350, md: 450 }, 
            boxShadow: 2 
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Stock Status
            </Typography>

            {/* Centered Chart Container */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box sx={{ width: 200, height: 200, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "In Stock",
                          value:
                            (dashboardData?.totalProducts || 0) -
                            (dashboardData?.lowStockItems || 0),
                          color: "#4CAF50",
                        },
                        {
                          name: "Low Stock",
                          value: dashboardData?.lowStockItems || 0,
                          color: "#FF9800",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[{ color: "#4CAF50" }, { color: "#FF9800" }].map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#1976d2" }}
                  >
                    {dashboardData?.totalProducts || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ mt: 3 }}>
              {/* In Stock Card */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  mb: 2,
                  backgroundColor: "#E8F5E9",
                  borderRadius: 2,
                  borderLeft: "4px solid #4CAF50",
                  boxShadow: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#4CAF50",
                      borderRadius: "50%",
                      mr: 2,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    In Stock
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#2E7D32" }}
                >
                  {(dashboardData?.totalProducts || 0) -
                    (dashboardData?.lowStockItems || 0)}
                </Typography>
              </Box>

              {/* Low Stock Card */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  backgroundColor: "#FFF3E0",
                  borderRadius: 2,
                  borderLeft: "4px solid #FF9800",
                  boxShadow: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#FF9800",
                      borderRadius: "50%",
                      mr: 2,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#E65100" }}
                  >
                    Low Stock Alert
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#E65100" }}
                >
                  {dashboardData?.lowStockItems || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} xl={6}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            height: { xs: 400, md: 450 }, 
            boxShadow: 2 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Chip
                icon={<TimeIcon />}
                label={`${recentTransactions.length} Recent`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            
            {transactionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : transactionsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {transactionsError}
                <Button size="small" onClick={fetchRecentTransactions} sx={{ ml: 1 }}>
                  Retry
                </Button>
              </Alert>
            ) : recentTransactions.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 300,
                color: 'text.secondary'
              }}>
                <InventoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No Recent Transactions
                </Typography>
                <Typography variant="body2">
                  Transaction history will appear here
                </Typography>
              </Box>
            ) : (
              <Box sx={{ height: 350, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {recentTransactions.map((transaction, index) => (
                    <ListItem
                      key={transaction.id || index}
                      sx={{
                        px: 0,
                        py: 2,
                        borderBottom: index < recentTransactions.length - 1 ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {transaction.product_name}
                            </Typography>
                            <Chip
                              label={transaction.movement_type}
                              size="small"
                              color={transaction.movement_type === 'IN' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: <strong>{Math.abs(transaction.quantity)}</strong>
                              {transaction.reason && ` • ${transaction.reason}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Stock Level Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            boxShadow: 2 
          }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Stock Level Alerts
                </Typography>
                <Chip
                  icon={<WarningIcon />}
                  label={`${lowStockItems.length} Items Need Attention`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Box>
              <Button 
                variant="contained" 
                size="small"
                sx={{ 
                  minWidth: 'auto',
                  px: 3
                }}
              >
                View All Inventory
              </Button>
            </Box>
            {lowStockItems.length === 0 ? (
              <Alert severity="success" sx={{ py: 2 }}>
                All items are adequately stocked!
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {lowStockItems.map((item) => {
                  const currentStock = item.current_stock || item.currentStock || 0;
                  const minStock = item.min_stock || item.minStock || 0;
                  const stockPercentage = minStock > 0 ? (currentStock / minStock) * 100 : 0;
                  const isCritical = currentStock < minStock * 0.5;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={item.id || item.product_id}>
                      <Card
                        sx={{
                          p: 3,
                          height: '100%',
                          border: `2px solid ${isCritical ? '#f4433620' : '#ff980020'}`,
                          borderLeft: `4px solid ${isCritical ? '#f44336' : '#ff9800'}`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: "1rem", 
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.product_name ||
                                item.productName ||
                                item.name ||
                                "Unknown Product"}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {item.category_name ||
                                item.categoryName ||
                                item.category ||
                                "General"}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Stock Level
                              </Typography>
                              <Chip
                                label={isCritical ? "Critical" : "Low Stock"}
                                size="small"
                                color={isCritical ? "error" : "warning"}
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(stockPercentage, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isCritical ? '#f4433620' : '#ff980020',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: isCritical ? '#f44336' : '#ff9800',
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>

                          <Box 
                            sx={{ 
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 2,
                              textAlign: 'center'
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 700,
                                  color: isCritical ? '#f44336' : '#ff9800',
                                  mb: 0.5,
                                }}
                              >
                                {currentStock}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Current
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 700,
                                  color: 'text.secondary',
                                  mb: 0.5,
                                }}
                              >
                                {minStock}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Required
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
