import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  FileDownload as ExportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AnalyticsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import { 
  reportsAPI, 
  inventoryAPI, 
  stockMovementsAPI,
  productsAPI 
} from "../../services/api";
import {
  calculateUsageTrends,
  generatePredictiveAnalytics,
  detectAnomalies,
  calculateInventoryMetrics,
  generateInsightsSummary,
  exportToCSV,
  exportToJSON,
  getDateRanges
} from "../../utils/analyticsUtils";
import { toast } from "react-toastify";
import UsageTrendAnalysis from "./UsageTrendAnalysis";
import AIInsightsEngine from "./AIInsightsEngine";

const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function MetricCard({ title, value, icon, color, trend, subtitle }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', color: color, mb: 1 }}
        >
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend.direction === 'up' ? (
              <TrendingUpIcon sx={{ color: '#4caf50', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ color: '#f44336', mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend.direction === 'up' ? '#4caf50' : '#f44336',
                fontWeight: 600,
              }}
            >
              {trend.percentage}% {trend.direction === 'up' ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }) {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'stock_critical':
        return <ErrorIcon />;
      case 'usage_anomaly':
        return <WarningIcon />;
      case 'reorder_planning':
        return <CheckIcon />;
      case 'slow_moving':
        return <SpeedIcon />;
      default:
        return <InsightsIcon />;
    }
  };

  const getInsightColor = (urgency) => {
    if (urgency > 80) return '#f44336';
    if (urgency > 60) return '#ff9800';
    if (urgency > 40) return '#2196f3';
    return '#4caf50';
  };

  return (
    <Card sx={{ mb: 2, borderLeft: `4px solid ${getInsightColor(insight.urgency || 50)}` }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar
            sx={{
              backgroundColor: `${getInsightColor(insight.urgency || 50)}20`,
              color: getInsightColor(insight.urgency || 50),
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            {getInsightIcon(insight.type)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {insight.message}
            </Typography>
            {insight.action && (
              <Typography variant="body2" color="text.secondary">
                Action: {insight.action}
              </Typography>
            )}
          </Box>
          {insight.priority && (
            <Chip
              label={insight.priority}
              size="small"
              color={insight.priority === 'critical' ? 'error' : 
                     insight.priority === 'high' ? 'warning' : 'default'}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function Analytics() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('last30Days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    inventory: [],
    stockMovements: [],
    products: []
  });
  const [analytics, setAnalytics] = useState({
    usageTrends: {},
    predictions: [],
    anomalies: [],
    metrics: {},
    insights: {}
  });

  const dateRanges = useMemo(() => getDateRanges(), []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [inventoryResponse, movementsResponse, productsResponse] = await Promise.all([
        inventoryAPI.getAll(),
        stockMovementsAPI.getAll({
          startDate: dateRanges[dateRange].start.toISOString(),
          endDate: dateRanges[dateRange].end.toISOString()
        }),
        productsAPI.getAll()
      ]);

      const inventoryData = inventoryResponse.data?.data || inventoryResponse.data || [];
      const movementsData = movementsResponse.data?.data || movementsResponse.data || [];
      const productsData = productsResponse.data?.data || productsResponse.data || [];

      setData({
        inventory: inventoryData,
        stockMovements: movementsData,
        products: productsData
      });

      // Process analytics
      const usageTrends = calculateUsageTrends(movementsData);
      const predictions = generatePredictiveAnalytics(inventoryData, usageTrends);
      const anomalies = detectAnomalies(movementsData);
      const metrics = calculateInventoryMetrics(inventoryData, movementsData);
      const insights = generateInsightsSummary(predictions, anomalies, metrics);

      setAnalytics({
        usageTrends,
        predictions,
        anomalies,
        metrics,
        insights
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format, dataType) => {
    try {
      let exportData = [];
      let filename = '';

      switch (dataType) {
        case 'predictions':
          exportData = analytics.predictions;
          filename = `inventory-predictions-${dateRange}`;
          break;
        case 'anomalies':
          exportData = analytics.anomalies;
          filename = `usage-anomalies-${dateRange}`;
          break;
        case 'metrics':
          exportData = [analytics.metrics];
          filename = `inventory-metrics-${dateRange}`;
          break;
        default:
          exportData = data.inventory;
          filename = `inventory-analytics-${dateRange}`;
      }

      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else {
        exportToJSON(exportData, filename);
      }
      
      toast.success(`${format.toUpperCase()} export completed`);
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const getUsageTrendChartData = () => {
    const trendData = Object.values(analytics.usageTrends)
      .filter(trend => trend.movements.length > 0)
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 10);

    return trendData.map(trend => ({
      name: trend.productName?.substring(0, 15) + '...' || 'Unknown',
      usage: trend.totalUsage,
      avgDaily: Math.round(trend.avgDailyUsage * 100) / 100,
      trend: trend.trend
    }));
  };

  const getCategoryDistributionData = () => {
    const categoryMap = {};
    data.inventory.forEach(item => {
      const category = item.category_name || item.categoryName || 'Uncategorized';
      const value = (item.current_stock || 0) * (item.unit_price || 0);
      categoryMap[category] = (categoryMap[category] || 0) + value;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics & Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              {Object.entries(dateRanges).map(([key, range]) => (
                <MenuItem key={key} value={key}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('csv', 'predictions')}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Products"
            value={analytics.insights.summary?.totalProducts || 0}
            icon={<AnalyticsIcon />}
            color="#2196f3"
            subtitle="Items analyzed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Critical Items"
            value={analytics.insights.summary?.criticalItems || 0}
            icon={<ErrorIcon />}
            color="#f44336"
            subtitle="Need immediate attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Anomalies"
            value={analytics.insights.summary?.anomaliesDetected || 0}
            icon={<WarningIcon />}
            color="#ff9800"
            subtitle="Usage patterns detected"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Inventory Health"
            value={analytics.insights.summary?.inventoryHealth || 'Good'}
            icon={<CheckIcon />}
            color={analytics.insights.summary?.inventoryHealth === 'good' ? '#4caf50' : 
                   analytics.insights.summary?.inventoryHealth === 'fair' ? '#ff9800' : '#f44336'}
            subtitle="Overall status"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="AI Insights" icon={<InsightsIcon />} />
          <Tab label="Usage Trends" icon={<TimelineIcon />} />
          <Tab label="Predictions" icon={<TrendingUpIcon />} />
          <Tab label="Performance" icon={<SpeedIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <AIInsightsEngine 
          inventoryData={data.inventory}
          stockMovements={data.stockMovements}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <UsageTrendAnalysis 
          stockMovements={data.stockMovements}
          selectedProducts={data.products}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Predictive Stock Alerts
              </Typography>
              <List>
                {analytics.predictions.slice(0, 10).map((prediction, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        backgroundColor: prediction.priority === 'critical' ? '#f4433620' :
                                       prediction.priority === 'high' ? '#ff980020' : '#2196f320',
                        color: prediction.priority === 'critical' ? '#f44336' :
                               prediction.priority === 'high' ? '#ff9800' : '#2196f3'
                      }}>
                        {prediction.priority === 'critical' ? <ErrorIcon /> : 
                         prediction.priority === 'high' ? <WarningIcon /> : <CheckIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={prediction.productName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Current: {prediction.currentStock} | 
                            Days until empty: {prediction.daysUntilEmpty} | 
                            Recommended order: {prediction.estimatedReorderQuantity}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((prediction.currentStock / prediction.reorderPoint) * 100, 100)}
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            color={prediction.priority === 'critical' ? 'error' :
                                   prediction.priority === 'high' ? 'warning' : 'primary'}
                          />
                        </Box>
                      }
                    />
                    <Chip
                      label={prediction.recommendation.replace('_', ' ')}
                      size="small"
                      color={prediction.priority === 'critical' ? 'error' :
                             prediction.priority === 'high' ? 'warning' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Fast Moving Items
              </Typography>
              <List>
                {analytics.metrics.fastMovingItems?.slice(0, 5).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.productName}
                      secondary={`Movement: ${item.totalMovement} units`}
                    />
                    <Chip label="Fast" color="success" size="small" />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Slow Moving Items
              </Typography>
              <List>
                {analytics.metrics.slowMovingItems?.slice(0, 5).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.productName}
                      secondary={`Last movement: ${item.daysSinceLastMovement} days ago`}
                    />
                    <Chip label="Slow" color="warning" size="small" />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}

export default Analytics;