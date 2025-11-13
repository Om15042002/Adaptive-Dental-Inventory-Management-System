import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Psychology as AIIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Lightbulb as InsightIcon,
  AutoFixHigh as AutoIcon,
  ExpandMore as ExpandMoreIcon,
  Stars as StarsIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  generatePredictiveAnalytics,
  detectAnomalies,
  generateInsightsSummary,
  calculateUsageTrends,
} from '../../utils/analyticsUtils';

const INSIGHT_TYPES = {
  CRITICAL: { color: '#f44336', icon: ErrorIcon, priority: 100 },
  WARNING: { color: '#ff9800', icon: WarningIcon, priority: 75 },
  OPTIMIZATION: { color: '#2196f3', icon: AutoIcon, priority: 50 },
  OPPORTUNITY: { color: '#4caf50', icon: InsightIcon, priority: 25 },
};

function AIRecommendationCard({ recommendation, onAccept, onDismiss }) {
  const getRecommendationType = (type) => {
    switch (type) {
      case 'reorder_urgent':
        return { ...INSIGHT_TYPES.CRITICAL, label: 'Urgent Reorder' };
      case 'stock_optimization':
        return { ...INSIGHT_TYPES.OPTIMIZATION, label: 'Stock Optimization' };
      case 'cost_saving':
        return { ...INSIGHT_TYPES.OPPORTUNITY, label: 'Cost Saving' };
      case 'process_improvement':
        return { ...INSIGHT_TYPES.WARNING, label: 'Process Improvement' };
      default:
        return { ...INSIGHT_TYPES.WARNING, label: 'General' };
    }
  };

  const recType = getRecommendationType(recommendation.type);
  const IconComponent = recType.icon;

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: `4px solid ${recType.color}`,
        '&:hover': { boxShadow: 3 }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: `${recType.color}20`,
              color: recType.color,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <IconComponent />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {recommendation.title}
              </Typography>
              <Chip 
                label={recType.label} 
                size="small" 
                sx={{ 
                  backgroundColor: `${recType.color}20`, 
                  color: recType.color,
                  fontWeight: 600
                }}
              />
              <Rating 
                value={recommendation.confidence / 20} 
                size="small" 
                readOnly 
                max={5}
              />
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {recommendation.description}
            </Typography>
            
            {recommendation.impact && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Expected Impact:</strong> {recommendation.impact}
                </Typography>
              </Alert>
            )}
            
            {recommendation.metrics && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Key Metrics:
                </Typography>
                {Object.entries(recommendation.metrics).map(([key, value]) => (
                  <Chip 
                    key={key} 
                    label={`${key}: ${value}`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
      
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => onAccept(recommendation)}
          sx={{ mr: 1 }}
        >
          Implement
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => onDismiss(recommendation.id)}
        >
          Dismiss
        </Button>
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            Confidence: {recommendation.confidence}%
          </Typography>
        </Box>
      </CardActions>
    </Card>
  );
}

function AnomalyDetector({ anomalies = [] }) {
  const severityLevels = {
    high: { color: '#f44336', label: 'High Risk', count: 0 },
    medium: { color: '#ff9800', label: 'Medium Risk', count: 0 },
    low: { color: '#4caf50', label: 'Low Risk', count: 0 },
  };

  anomalies.forEach(anomaly => {
    severityLevels[anomaly.severity].count++;
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        🔍 Anomaly Detection
      </Typography>
      
      {/* Severity Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(severityLevels).map(([severity, info]) => (
          <Grid item xs={4} key={severity}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ color: info.color, fontWeight: 'bold' }}>
                {info.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {info.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Anomaly List */}
      <List>
        {anomalies.slice(0, 5).map((anomaly, index) => (
          <ListItem key={index} sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 1, 
            mb: 1,
            borderLeft: `4px solid ${severityLevels[anomaly.severity].color}`
          }}>
            <ListItemIcon>
              <Avatar sx={{ 
                backgroundColor: `${severityLevels[anomaly.severity].color}20`,
                color: severityLevels[anomaly.severity].color,
                width: 40,
                height: 40
              }}>
                <WarningIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {anomaly.productName}
                  </Typography>
                  <Chip 
                    label={anomaly.type.replace('_', ' ')} 
                    size="small" 
                    color={anomaly.severity === 'high' ? 'error' : 'warning'}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expected: {anomaly.expectedQuantity} units | 
                    Actual: {anomaly.quantity} units | 
                    Deviation: {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Detected on: {new Date(anomaly.date).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function PredictiveInsights({ predictions = [] }) {
  const riskLevels = predictions.reduce((acc, pred) => {
    acc[pred.priority] = (acc[pred.priority] || 0) + 1;
    return acc;
  }, {});

  const getHealthScore = () => {
    const totalItems = predictions.length;
    const criticalItems = riskLevels.critical || 0;
    const highRiskItems = riskLevels.high || 0;
    
    if (totalItems === 0) return 100;
    
    const riskRatio = (criticalItems * 3 + highRiskItems * 2) / totalItems;
    return Math.max(0, Math.min(100, 100 - riskRatio * 20));
  };

  const healthScore = getHealthScore();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        🔮 Predictive Insights
      </Typography>
      
      {/* Health Score */}
      <Card sx={{ mb: 3, p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 'bold',
          color: healthScore > 80 ? '#4caf50' : healthScore > 60 ? '#ff9800' : '#f44336',
          mb: 1
        }}>
          {Math.round(healthScore)}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Inventory Health Score
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={healthScore} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthScore > 80 ? '#4caf50' : healthScore > 60 ? '#ff9800' : '#f44336'
            }
          }} 
        />
      </Card>

      {/* Risk Distribution */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              {riskLevels.critical || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Critical
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              {riskLevels.high || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Risk
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
              {riskLevels.medium || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medium Risk
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {riskLevels.low || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Low Risk
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Top Predictions */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Top Priority Items:
      </Typography>
      <List>
        {predictions.slice(0, 5).map((prediction, index) => (
          <ListItem key={index} sx={{ px: 0, py: 1 }}>
            <ListItemIcon>
              <Badge 
                badgeContent={index + 1} 
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
              >
                <Avatar sx={{ 
                  backgroundColor: 
                    prediction.priority === 'critical' ? '#f4433620' :
                    prediction.priority === 'high' ? '#ff980020' : '#2196f320',
                  color: 
                    prediction.priority === 'critical' ? '#f44336' :
                    prediction.priority === 'high' ? '#ff9800' : '#2196f3',
                  width: 32,
                  height: 32
                }}>
                  {prediction.priority === 'critical' ? <ErrorIcon /> : 
                   prediction.priority === 'high' ? <WarningIcon /> : <CheckIcon />}
                </Avatar>
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={prediction.productName}
              secondary={`${prediction.daysUntilEmpty} days remaining • Reorder: ${prediction.estimatedReorderQuantity} units`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function AIInsightsEngine({ inventoryData = [], stockMovements = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());
  const [selectedInsightType, setSelectedInsightType] = useState('all');

  const analytics = useMemo(() => {
    const usageTrends = calculateUsageTrends(stockMovements);
    const predictions = generatePredictiveAnalytics(inventoryData, usageTrends);
    const anomalies = detectAnomalies(stockMovements);
    const insights = generateInsightsSummary(predictions, anomalies, {});

    return { usageTrends, predictions, anomalies, insights };
  }, [inventoryData, stockMovements]);

  useEffect(() => {
    generateAIRecommendations();
  }, [analytics]);

  const generateAIRecommendations = () => {
    const newRecommendations = [];

    // Generate reorder recommendations
    analytics.predictions
      .filter(p => p.priority === 'critical' || p.urgency > 80)
      .slice(0, 3)
      .forEach((prediction, index) => {
        newRecommendations.push({
          id: `reorder_${prediction.productId}_${index}`,
          type: 'reorder_urgent',
          title: `Urgent Reorder Required: ${prediction.productName}`,
          description: `This item will run out in ${prediction.daysUntilEmpty} days. Immediate action required to prevent stockout.`,
          confidence: 95,
          impact: `Prevent stockout, maintain ${prediction.avgDailyUsage.toFixed(1)} units/day usage`,
          metrics: {
            'Current Stock': prediction.currentStock,
            'Days Remaining': prediction.daysUntilEmpty,
            'Recommended Order': prediction.estimatedReorderQuantity
          },
          priority: 100,
          category: 'stock_management'
        });
      });

    // Generate optimization recommendations
    analytics.predictions
      .filter(p => p.trend === 'decreasing' && p.currentStock > p.reorderPoint * 2)
      .slice(0, 2)
      .forEach((prediction, index) => {
        newRecommendations.push({
          id: `optimize_${prediction.productId}_${index}`,
          type: 'stock_optimization',
          title: `Stock Optimization: ${prediction.productName}`,
          description: `Usage is declining but stock levels remain high. Consider reducing order quantities.`,
          confidence: 75,
          impact: `Reduce carrying costs by ~15-20%`,
          metrics: {
            'Current Stock': prediction.currentStock,
            'Optimal Stock': Math.round(prediction.reorderPoint * 1.5),
            'Potential Savings': `$${((prediction.currentStock - prediction.reorderPoint * 1.5) * 10).toFixed(0)}`
          },
          priority: 50,
          category: 'cost_optimization'
        });
      });

    // Generate anomaly-based recommendations
    analytics.anomalies
      .filter(a => a.severity === 'high')
      .slice(0, 2)
      .forEach((anomaly, index) => {
        newRecommendations.push({
          id: `anomaly_${anomaly.productId}_${index}`,
          type: 'process_improvement',
          title: `Usage Pattern Alert: ${anomaly.productName}`,
          description: `Unusual ${anomaly.type.replace('_', ' ')} detected. Review usage processes and training.`,
          confidence: 70,
          impact: `Improve inventory accuracy and reduce waste`,
          metrics: {
            'Expected Usage': anomaly.expectedQuantity,
            'Actual Usage': anomaly.quantity,
            'Deviation': `${anomaly.deviation > 0 ? '+' : ''}${anomaly.deviation}`
          },
          priority: 75,
          category: 'process_improvement'
        });
      });

    // Generate cost-saving opportunities
    const highValueSlowMoving = inventoryData
      .filter(item => {
        const value = (item.current_stock || 0) * (item.unit_price || 0);
        const trend = analytics.usageTrends[item.product_id || item.id];
        return value > 1000 && (!trend || trend.avgDailyUsage < 1);
      })
      .slice(0, 1);

    highValueSlowMoving.forEach((item, index) => {
      const value = (item.current_stock || 0) * (item.unit_price || 0);
      newRecommendations.push({
        id: `cost_saving_${item.product_id || item.id}_${index}`,
        type: 'cost_saving',
        title: `Cost Saving Opportunity: ${item.product_name || item.name}`,
        description: `High-value item with low usage. Consider promotional pricing or supplier negotiation.`,
        confidence: 60,
        impact: `Potential cost savings of $${(value * 0.1).toFixed(0)}`,
        metrics: {
          'Current Value': `$${value.toFixed(0)}`,
          'Usage Rate': 'Low',
          'Opportunity': 'Promotion/Negotiation'
        },
        priority: 25,
        category: 'cost_optimization'
      });
    });

    setRecommendations(newRecommendations.sort((a, b) => b.priority - a.priority));
  };

  const handleAcceptRecommendation = (recommendation) => {
    console.log('Implementing recommendation:', recommendation);
    // Here you would integrate with your inventory management system
    setDismissedRecommendations(prev => new Set([...prev, recommendation.id]));
  };

  const handleDismissRecommendation = (recommendationId) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  };

  const filteredRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.has(rec.id) &&
           (selectedInsightType === 'all' || rec.category === selectedInsightType)
  );

  return (
    <Box>
      <Grid container spacing={3}>
        {/* AI Recommendations */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🤖 AI-Powered Recommendations
              </Typography>
              <Chip 
                icon={<StarsIcon />}
                label={`${filteredRecommendations.length} Active`}
                color="primary"
                variant="outlined"
              />
            </Box>
            
            {filteredRecommendations.length === 0 ? (
              <Alert severity="success" icon={<CheckIcon />}>
                Great! No critical recommendations at this time. Your inventory is well managed.
              </Alert>
            ) : (
              filteredRecommendations.map((recommendation, index) => (
                <AIRecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAccept={handleAcceptRecommendation}
                  onDismiss={handleDismissRecommendation}
                />
              ))
            )}
          </Paper>
        </Grid>

        {/* Predictive Insights */}
        <Grid item xs={12} lg={4}>
          <PredictiveInsights predictions={analytics.predictions} />
        </Grid>

        {/* Anomaly Detection */}
        <Grid item xs={12}>
          <AnomalyDetector anomalies={analytics.anomalies} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIInsightsEngine;