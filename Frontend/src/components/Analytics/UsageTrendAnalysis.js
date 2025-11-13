import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { calculateUsageTrends } from '../../utils/analyticsUtils';

const CHART_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
};

function TrendIndicator({ trend, value }) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon sx={{ color: CHART_COLORS.success }} />;
      case 'decreasing':
        return <TrendingDownIcon sx={{ color: CHART_COLORS.error }} />;
      default:
        return <TimelineIcon sx={{ color: CHART_COLORS.info }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return CHART_COLORS.success;
      case 'decreasing':
        return CHART_COLORS.error;
      default:
        return CHART_COLORS.info;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {getTrendIcon()}
      <Typography
        variant="body2"
        sx={{ color: getTrendColor(), fontWeight: 600 }}
      >
        {trend.charAt(0).toUpperCase() + trend.slice(1)} ({value})
      </Typography>
    </Box>
  );
}

function PredictiveChart({ data, productName, showPrediction = false }) {
  // Generate prediction data based on trend
  const generatePredictions = (historicalData) => {
    if (historicalData.length < 2) return [];
    
    const lastPoint = historicalData[historicalData.length - 1];
    const secondLastPoint = historicalData[historicalData.length - 2];
    const trend = lastPoint.value - secondLastPoint.value;
    
    const predictions = [];
    for (let i = 1; i <= 30; i++) {
      const predictedValue = Math.max(0, lastPoint.value + (trend * i));
      predictions.push({
        date: `Future +${i}d`,
        value: Math.round(predictedValue * 100) / 100,
        isPrediction: true,
      });
    }
    return predictions;
  };

  const chartData = useMemo(() => {
    const historical = data.map((point, index) => ({
      date: `Day ${index + 1}`,
      value: point.quantity,
      isPrediction: false,
    }));
    
    if (showPrediction) {
      const predictions = generatePredictions(historical);
      return [...historical, ...predictions.slice(0, 7)]; // Show 7 days prediction
    }
    
    return historical;
  }, [data, showPrediction]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          angle={-45} 
          textAnchor="end" 
          height={80} 
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip 
          labelFormatter={(label) => `Date: ${label}`}
          formatter={(value, name) => [
            `${value} units`,
            name === 'Historical' ? 'Actual Usage' : 'Predicted Usage'
          ]}
        />
        <Area
          dataKey="value"
          fill={CHART_COLORS.primary}
          fillOpacity={0.1}
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Historical"
          connectNulls={false}
        />
        {showPrediction && (
          <Line
            type="monotone"
            dataKey={(entry) => entry.isPrediction ? entry.value : null}
            stroke={CHART_COLORS.warning}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: CHART_COLORS.warning }}
            name="Prediction"
            connectNulls={true}
          />
        )}
        {showPrediction && (
          <ReferenceLine
            x={`Day ${data.length}`}
            stroke={CHART_COLORS.error}
            strokeDasharray="2 2"
            label={{ value: "Prediction Start", position: "topRight" }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function UsageTrendAnalysis({ stockMovements = [], selectedProducts = [] }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [chartType, setChartType] = useState('line');
  const [showPredictions, setShowPredictions] = useState(false);
  const [trendSensitivity, setTrendSensitivity] = useState(50);
  const [analysisType, setAnalysisType] = useState('usage');

  const usageTrends = useMemo(() => 
    calculateUsageTrends(stockMovements), [stockMovements]
  );

  const trendAnalysis = useMemo(() => {
    const products = Object.entries(usageTrends).map(([productId, trend]) => ({
      productId,
      ...trend,
      velocityScore: trend.avgDailyUsage * (trend.movements.length / 30), // Movement frequency factor
      consistencyScore: trend.movements.length > 1 ? 
        1 - (Math.sqrt(trend.movements.reduce((acc, m, i, arr) => {
          if (i === 0) return 0;
          return acc + Math.pow(m.quantity - arr[i-1].quantity, 2);
        }, 0) / Math.max(trend.movements.length - 1, 1)) / Math.max(trend.avgDailyUsage, 1)) : 0
    }));

    return {
      products,
      totalProducts: products.length,
      highVelocity: products.filter(p => p.velocityScore > 10),
      lowVelocity: products.filter(p => p.velocityScore < 2),
      consistent: products.filter(p => p.consistencyScore > 0.7),
      erratic: products.filter(p => p.consistencyScore < 0.3),
    };
  }, [usageTrends]);

  const selectedProductData = useMemo(() => {
    if (!selectedProduct || !usageTrends[selectedProduct]) return null;
    return usageTrends[selectedProduct];
  }, [selectedProduct, usageTrends]);

  const getVelocityInsights = () => {
    const insights = [];
    
    if (trendAnalysis.highVelocity.length > 0) {
      insights.push({
        type: 'high_velocity',
        severity: 'warning',
        message: `${trendAnalysis.highVelocity.length} products have high usage velocity`,
        recommendation: 'Monitor stock levels closely and consider increasing reorder points',
        items: trendAnalysis.highVelocity.slice(0, 3)
      });
    }

    if (trendAnalysis.erratic.length > 0) {
      insights.push({
        type: 'erratic_usage',
        severity: 'info',
        message: `${trendAnalysis.erratic.length} products show erratic usage patterns`,
        recommendation: 'Investigate usage drivers and consider demand forecasting',
        items: trendAnalysis.erratic.slice(0, 3)
      });
    }

    if (trendAnalysis.lowVelocity.length > 0) {
      insights.push({
        type: 'slow_moving',
        severity: 'success',
        message: `${trendAnalysis.lowVelocity.length} products have low usage velocity`,
        recommendation: 'Consider reducing stock levels or promotional activities',
        items: trendAnalysis.lowVelocity.slice(0, 3)
      });
    }

    return insights;
  };

  const getChartComponent = () => {
    if (!selectedProductData) return null;

    const chartData = selectedProductData.movements
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((movement, index) => ({
        date: new Date(movement.date).toLocaleDateString(),
        value: movement.quantity,
        cumulative: selectedProductData.movements
          .slice(0, index + 1)
          .reduce((sum, m) => sum + m.quantity, 0),
      }));

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Scatter dataKey="value" fill={CHART_COLORS.secondary} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <PredictiveChart 
            data={selectedProductData.movements}
            productName={selectedProductData.productName}
            showPrediction={showPredictions}
          />
        );
    }
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Usage Trend Analysis Controls
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Product</InputLabel>
              <Select
                value={selectedProduct}
                label="Select Product"
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {Object.entries(usageTrends).map(([productId, trend]) => (
                  <MenuItem key={productId} value={productId}>
                    {trend.productName || `Product ${productId}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
                <MenuItem value="scatter">Scatter Plot</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={analysisType}
                label="Analysis Type"
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <MenuItem value="usage">Usage Patterns</MenuItem>
                <MenuItem value="velocity">Velocity Analysis</MenuItem>
                <MenuItem value="seasonality">Seasonality</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPredictions}
                  onChange={(e) => setShowPredictions(e.target.checked)}
                />
              }
              label="Show AI Predictions"
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedProductData ? 
                  `Usage Trend: ${selectedProductData.productName}` : 
                  'Select a product to view trends'
                }
              </Typography>
              {selectedProductData && (
                <TrendIndicator 
                  trend={selectedProductData.trend} 
                  value={`${selectedProductData.avgDailyUsage.toFixed(2)}/day`}
                />
              )}
            </Box>
            
            {selectedProductData ? (
              getChartComponent()
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 400,
                color: 'text.secondary'
              }}>
                <AnalyticsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">
                  Select a product to view detailed trend analysis
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Insights Panel */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Trend Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {trendAnalysis.totalProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {trendAnalysis.highVelocity.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Velocity
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {trendAnalysis.consistent.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consistent
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {trendAnalysis.erratic.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erratic
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              AI Insights
            </Typography>
            {getVelocityInsights().map((insight, index) => (
              <Alert 
                key={index} 
                severity={insight.severity} 
                sx={{ mb: 2 }}
                icon={
                  insight.type === 'high_velocity' ? <SpeedIcon /> :
                  insight.type === 'erratic_usage' ? <WarningIcon /> : <CheckIcon />
                }
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {insight.message}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {insight.recommendation}
                </Typography>
              </Alert>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Product Rankings */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Product Velocity Rankings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
              🚀 High Velocity
            </Typography>
            <List dense>
              {trendAnalysis.highVelocity.slice(0, 5).map((product, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={product.productName}
                    secondary={`${product.velocityScore.toFixed(1)} velocity score`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              📊 Most Consistent
            </Typography>
            <List dense>
              {trendAnalysis.consistent.slice(0, 5).map((product, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={product.productName}
                    secondary={`${(product.consistencyScore * 100).toFixed(0)}% consistency`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
              🔄 Most Erratic
            </Typography>
            <List dense>
              {trendAnalysis.erratic.slice(0, 5).map((product, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={product.productName}
                    secondary={`${(product.consistencyScore * 100).toFixed(0)}% consistency`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default UsageTrendAnalysis;