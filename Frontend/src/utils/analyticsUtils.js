// Analytics Data Processing Utilities

// Helper functions for date manipulation
const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const subMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

/**
 * Calculate usage trends and patterns
 */
export const calculateUsageTrends = (stockMovements = []) => {
  const trends = {};
  
  // Group movements by product and calculate trends
  stockMovements.forEach(movement => {
    const productId = movement.product_id || movement.productId;
    const date = new Date(movement.created_at || movement.date);
    const quantity = Math.abs(movement.quantity_changed || movement.quantity || 0);
    
    if (!trends[productId]) {
      trends[productId] = {
        productName: movement.product_name || movement.productName,
        totalUsage: 0,
        movements: [],
        avgDailyUsage: 0,
        trend: 'stable'
      };
    }
    
    trends[productId].totalUsage += quantity;
    trends[productId].movements.push({ date, quantity });
  });
  
  // Calculate trends and predictions
  Object.keys(trends).forEach(productId => {
    const product = trends[productId];
    const movements = product.movements.sort((a, b) => a.date - b.date);
    
    if (movements.length > 1) {
      const daysDiff = Math.max(1, Math.ceil(
        (movements[movements.length - 1].date - movements[0].date) / (1000 * 60 * 60 * 24)
      ));
      product.avgDailyUsage = product.totalUsage / daysDiff;
      
      // Calculate trend direction
      const firstHalf = movements.slice(0, Math.floor(movements.length / 2));
      const secondHalf = movements.slice(Math.floor(movements.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.quantity, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.quantity, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg * 1.2) {
        product.trend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg * 0.8) {
        product.trend = 'decreasing';
      } else {
        product.trend = 'stable';
      }
    }
  });
  
  return trends;
};

/**
 * Generate predictive analytics for stock requirements
 */
export const generatePredictiveAnalytics = (inventoryData = [], usageTrends = {}) => {
  const predictions = [];
  
  inventoryData.forEach(item => {
    const productId = item.product_id || item.id;
    const currentStock = item.current_stock || item.currentStock || 0;
    const minStock = item.min_stock || item.minStock || 0;
    const trend = usageTrends[productId];
    
    if (trend && trend.avgDailyUsage > 0) {
      const daysUntilEmpty = Math.floor(currentStock / trend.avgDailyUsage);
      const reorderPoint = minStock + (trend.avgDailyUsage * 7); // 7 days buffer
      
      let recommendation = 'maintain';
      let priority = 'low';
      let urgency = 0;
      
      if (currentStock <= 0) {
        recommendation = 'urgent_reorder';
        priority = 'critical';
        urgency = 100;
      } else if (currentStock <= minStock) {
        recommendation = 'reorder_now';
        priority = 'high';
        urgency = 80;
      } else if (currentStock <= reorderPoint) {
        recommendation = 'plan_reorder';
        priority = 'medium';
        urgency = 60;
      } else if (trend.trend === 'increasing' && daysUntilEmpty < 30) {
        recommendation = 'monitor_closely';
        priority = 'medium';
        urgency = 40;
      }
      
      predictions.push({
        productId,
        productName: item.product_name || item.productName || item.name,
        currentStock,
        minStock,
        avgDailyUsage: trend.avgDailyUsage,
        daysUntilEmpty,
        reorderPoint,
        recommendation,
        priority,
        urgency,
        trend: trend.trend,
        estimatedReorderQuantity: Math.max(minStock * 2, Math.ceil(trend.avgDailyUsage * 30))
      });
    }
  });
  
  return predictions.sort((a, b) => b.urgency - a.urgency);
};

/**
 * Detect anomalies in inventory usage patterns
 */
export const detectAnomalies = (stockMovements = []) => {
  const anomalies = [];
  const productUsage = {};
  
  // Group by product and calculate normal usage patterns
  stockMovements.forEach(movement => {
    const productId = movement.product_id || movement.productId;
    const quantity = Math.abs(movement.quantity_changed || movement.quantity || 0);
    
    if (!productUsage[productId]) {
      productUsage[productId] = {
        productName: movement.product_name || movement.productName,
        quantities: [],
        dates: []
      };
    }
    
    productUsage[productId].quantities.push(quantity);
    productUsage[productId].dates.push(new Date(movement.created_at || movement.date));
  });
  
  // Detect anomalies
  Object.keys(productUsage).forEach(productId => {
    const usage = productUsage[productId];
    
    if (usage.quantities.length < 3) return; // Need minimum data points
    
    const mean = usage.quantities.reduce((sum, q) => sum + q, 0) / usage.quantities.length;
    const variance = usage.quantities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / usage.quantities.length;
    const stdDev = Math.sqrt(variance);
    
    usage.quantities.forEach((quantity, index) => {
      const zScore = Math.abs((quantity - mean) / stdDev);
      
      if (zScore > 2) { // Anomaly threshold
        anomalies.push({
          productId,
          productName: usage.productName,
          date: usage.dates[index],
          quantity,
          expectedQuantity: Math.round(mean),
          deviation: Math.round((quantity - mean) * 100) / 100,
          severity: zScore > 3 ? 'high' : 'medium',
          type: quantity > mean ? 'unusually_high' : 'unusually_low'
        });
      }
    });
  });
  
  return anomalies.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Calculate inventory turnover metrics
 */
export const calculateInventoryMetrics = (inventoryData = [], stockMovements = []) => {
  const metrics = {
    totalValue: 0,
    turnoverRate: 0,
    avgDaysToSell: 0,
    fastMovingItems: [],
    slowMovingItems: [],
    deadStock: []
  };
  
  // Calculate total inventory value
  metrics.totalValue = inventoryData.reduce((sum, item) => {
    const stock = item.current_stock || item.currentStock || 0;
    const price = item.unit_price || item.unitPrice || 0;
    return sum + (stock * price);
  }, 0);
  
  // Analyze movement patterns
  const last90Days = subDays(new Date(), 90);
  const recentMovements = stockMovements.filter(m => 
    new Date(m.created_at || m.date) >= last90Days
  );
  
  const productActivity = {};
  recentMovements.forEach(movement => {
    const productId = movement.product_id || movement.productId;
    if (!productActivity[productId]) {
      productActivity[productId] = {
        productName: movement.product_name || movement.productName,
        totalMovement: 0,
        lastMovement: null
      };
    }
    
    productActivity[productId].totalMovement += Math.abs(movement.quantity_changed || movement.quantity || 0);
    const movementDate = new Date(movement.created_at || movement.date);
    if (!productActivity[productId].lastMovement || movementDate > productActivity[productId].lastMovement) {
      productActivity[productId].lastMovement = movementDate;
    }
  });
  
  // Categorize items
  inventoryData.forEach(item => {
    const productId = item.product_id || item.id;
    const activity = productActivity[productId];
    const daysSinceLastMovement = activity?.lastMovement 
      ? Math.floor((new Date() - activity.lastMovement) / (1000 * 60 * 60 * 24))
      : 999;
    
    const itemData = {
      productId,
      productName: item.product_name || item.productName || item.name,
      currentStock: item.current_stock || item.currentStock || 0,
      totalMovement: activity?.totalMovement || 0,
      daysSinceLastMovement
    };
    
    if (daysSinceLastMovement > 180) {
      metrics.deadStock.push(itemData);
    } else if (daysSinceLastMovement > 90 || (activity?.totalMovement || 0) < 5) {
      metrics.slowMovingItems.push(itemData);
    } else if ((activity?.totalMovement || 0) > 50) {
      metrics.fastMovingItems.push(itemData);
    }
  });
  
  return metrics;
};

/**
 * Export data utilities
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate insights summary
 */
export const generateInsightsSummary = (predictions, anomalies, metrics) => {
  const insights = {
    criticalAlerts: [],
    recommendations: [],
    trends: [],
    summary: {
      totalProducts: predictions.length,
      criticalItems: predictions.filter(p => p.priority === 'critical').length,
      anomaliesDetected: anomalies.length,
      inventoryHealth: 'good'
    }
  };
  
  // Critical alerts
  insights.criticalAlerts = predictions
    .filter(p => p.priority === 'critical' || p.urgency > 80)
    .slice(0, 5)
    .map(p => ({
      type: 'stock_critical',
      message: `${p.productName} is critically low (${p.currentStock} units remaining)`,
      urgency: p.urgency,
      action: 'Immediate reorder required'
    }));
  
  // Add anomaly alerts
  anomalies
    .filter(a => a.severity === 'high')
    .slice(0, 3)
    .forEach(a => {
      insights.criticalAlerts.push({
        type: 'usage_anomaly',
        message: `Unusual ${a.type.replace('_', ' ')} usage detected for ${a.productName}`,
        urgency: 70,
        action: 'Review usage patterns'
      });
    });
  
  // Recommendations
  insights.recommendations = [
    ...predictions
      .filter(p => p.recommendation === 'plan_reorder')
      .slice(0, 3)
      .map(p => ({
        type: 'reorder_planning',
        message: `Consider reordering ${p.productName} (${p.daysUntilEmpty} days remaining)`,
        priority: p.priority
      })),
    ...metrics.slowMovingItems
      .slice(0, 2)
      .map(item => ({
        type: 'slow_moving',
        message: `${item.productName} has low turnover - consider promotion or adjustment`,
        priority: 'low'
      }))
  ];
  
  // Health assessment
  const criticalRatio = insights.summary.criticalItems / Math.max(insights.summary.totalProducts, 1);
  if (criticalRatio > 0.2) {
    insights.summary.inventoryHealth = 'poor';
  } else if (criticalRatio > 0.1 || anomalies.length > 5) {
    insights.summary.inventoryHealth = 'fair';
  }
  
  return insights;
};

// Date range utilities for analytics
export const getDateRanges = () => ({
  last7Days: {
    start: subDays(new Date(), 7),
    end: new Date(),
    label: 'Last 7 Days'
  },
  last30Days: {
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days'
  },
  last90Days: {
    start: subDays(new Date(), 90),
    end: new Date(),
    label: 'Last 90 Days'
  },
  last6Months: {
    start: subMonths(new Date(), 6),
    end: new Date(),
    label: 'Last 6 Months'
  },
  lastYear: {
    start: subMonths(new Date(), 12),
    end: new Date(),
    label: 'Last Year'
  }
});
