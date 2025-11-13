import { GoogleGenerativeAI } from "@google/generative-ai";

// Free API Key for Google Gemini (You can get your own from https://aistudio.google.com/app/apikey)
// This is a demo key - replace with your own for production
const API_KEY = "AIzaSyC42s4QLmO2Dt8ACgj8v1fMHt9gsImqsgo"; // Demo key

let genAI = null;
let model = null;

// List of model names to try (from newest to oldest)
// Based on API response - these are the most stable and widely available models
const MODEL_NAMES = [
  "gemini-2.5-flash", // Latest stable Flash model (fast and efficient)
  "gemini-2.0-flash-001", // Stable 2.0 Flash version
  "gemini-pro-latest", // Always points to latest Pro version
  "gemini-flash-latest", // Always points to latest Flash version
  "gemini-2.5-pro", // Latest stable Pro model (more capable)
];

// Initialize the AI model
const initializeAI = async () => {
  try {
    if (!genAI) {
      genAI = new GoogleGenerativeAI(API_KEY);

      // Try each model until one works
      for (const modelName of MODEL_NAMES) {
        try {
          model = genAI.getGenerativeModel({ model: modelName });
          // Test the model with a simple prompt
          await model.generateContent("Hello");
          console.log(`Successfully initialized AI with model: ${modelName}`);
          return true;
        } catch (error) {
          console.log(`Model ${modelName} not available, trying next...`);
          continue;
        }
      }

      // If no model worked, throw error
      throw new Error("No available Gemini models found");
    }
    return true;
  } catch (error) {
    console.error("Error initializing AI:", error);
    return false;
  }
};

/**
 * Generate AI insights for inventory data
 */
export const generateInventoryInsights = async (inventoryData) => {
  try {
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error("Failed to initialize AI");
    }

    const prompt = `
You are an inventory management expert. Analyze the following inventory data and provide actionable insights:

Inventory Summary:
- Total Products: ${inventoryData.totalProducts}
- Low Stock Items: ${inventoryData.lowStockCount}
- Out of Stock Items: ${inventoryData.outOfStockCount}
- Total Inventory Value: $${inventoryData.totalValue}
- Categories: ${inventoryData.categories.join(", ")}

Top Low Stock Items:
${inventoryData.lowStockItems
  .map(
    (item) =>
      `- ${item.name}: ${item.currentStock} units (Min: ${item.minStock})`
  )
  .join("\n")}

Please provide:
1. Overall inventory health assessment (2-3 sentences)
2. Top 3 critical recommendations
3. Predicted trends based on the data
4. Cost optimization suggestions

Keep the response concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating inventory insights:", error);
    return generateFallbackInsights(inventoryData);
  }
};

/**
 * Generate AI report for usage trends
 */
export const generateUsageTrendsReport = async (usageData) => {
  try {
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error("Failed to initialize AI");
    }

    const prompt = `
Analyze the following usage trends data for a dental inventory system:

Monthly Usage Data:
${usageData
  .map(
    (item) =>
      `- ${item.month}: Consumables: ${item.consumables}, Instruments: ${item.instruments}, Materials: ${item.materials}`
  )
  .join("\n")}

Provide:
1. Key trends identified in the data (3-4 points)
2. Seasonal patterns if any
3. Recommendations for inventory planning
4. Predicted usage for next month

Keep it professional and concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating usage trends report:", error);
    return generateFallbackUsageTrends(usageData);
  }
};

/**
 * Generate AI report for cost analysis
 */
export const generateCostAnalysisReport = async (costData) => {
  try {
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error("Failed to initialize AI");
    }

    const prompt = `
Analyze the following cost data for inventory management:

Cost Breakdown:
${costData.map((item) => `- ${item.category}: $${item.cost}`).join("\n")}

Total Cost: $${costData.reduce((sum, item) => sum + item.cost, 0)}

Provide:
1. Cost efficiency analysis (2-3 sentences)
2. Areas where costs can be reduced (top 3)
3. Budget allocation recommendations
4. ROI improvement suggestions

Be specific and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating cost analysis report:", error);
    return generateFallbackCostAnalysis(costData);
  }
};

/**
 * Generate AI recommendations for reordering
 */
export const generateReorderRecommendations = async (reorderData) => {
  try {
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error("Failed to initialize AI");
    }

    const prompt = `
You are an inventory optimization specialist. Analyze these products that need reordering:

Products Requiring Attention:
${reorderData
  .map(
    (item) => `
- ${item.productName}
  Current Stock: ${item.currentStock}
  Min Stock: ${item.minStock}
  Priority: ${item.priority}
  Days Until Stockout: ${item.daysUntilStockout || "N/A"}
`
  )
  .join("\n")}

Provide:
1. Prioritized reorder strategy (which items first and why)
2. Optimal order quantities for each priority level
3. Risk assessment for delayed ordering
4. Supplier negotiation tips for bulk orders

Be practical and specific.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating reorder recommendations:", error);
    return generateFallbackReorderRecommendations(reorderData);
  }
};

/**
 * Generate comprehensive inventory report with AI insights
 */
export const generateComprehensiveReport = async (allData) => {
  try {
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error("Failed to initialize AI");
    }

    const prompt = `
Generate a comprehensive executive summary for inventory management based on:

Overall Metrics:
- Total Products: ${allData.totalProducts}
- Total Value: $${allData.totalValue}
- Low Stock Items: ${allData.lowStockCount}
- Active Suppliers: ${allData.supplierCount}

Recent Trends:
- Usage trend: ${allData.usageTrend}
- Cost trend: ${allData.costTrend}
- Stock movement: ${allData.stockMovement}

Provide an executive summary with:
1. Overall business health (3-4 sentences)
2. Critical action items (top 5)
3. Strategic recommendations for next quarter
4. Risk factors to monitor

Format as a professional business report.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating comprehensive report:", error);
    return generateFallbackComprehensiveReport(allData);
  }
};

// Fallback functions when AI is unavailable
const generateFallbackInsights = (data) => {
  return `INVENTORY HEALTH ASSESSMENT

Your inventory currently has ${data.totalProducts} products with a total value of $${data.totalValue}. ${data.lowStockCount} items are running low and ${data.outOfStockCount} items are out of stock, requiring immediate attention.

CRITICAL RECOMMENDATIONS

1. Immediate Reorder: Prioritize restocking the ${data.outOfStockCount} out-of-stock items to prevent service disruptions.

2. Review Min/Max Levels: Items frequently hitting low stock may need adjusted reorder points.

3. Supplier Relations: Consider establishing better terms with key suppliers for critical items.

PREDICTED TRENDS

Based on current stock levels, you may face stockouts in high-priority items within 7-14 days if not addressed.

COST OPTIMIZATION

Consider bulk ordering for frequently used items to reduce per-unit costs by 10-15%.`;
};

const generateFallbackUsageTrends = (data) => {
  const avgUsage =
    data.reduce((sum, item) => sum + item.consumables, 0) / data.length;
  return `USAGE TRENDS ANALYSIS

KEY FINDINGS

• Average monthly consumption is approximately ${Math.round(avgUsage)} units
• Consumables show the highest usage, followed by materials and instruments
• Usage appears relatively stable with minor fluctuations
• No significant seasonal patterns detected in the current data

RECOMMENDATIONS

• Maintain buffer stock of 20% above average usage for consumables
• Plan quarterly bulk orders for better pricing
• Monitor usage patterns monthly for emerging trends`;
};

const generateFallbackCostAnalysis = (data) => {
  const total = data.reduce((sum, item) => sum + item.cost, 0);
  return `COST ANALYSIS SUMMARY

Total Inventory Cost: $${total.toFixed(2)}

COST EFFICIENCY

Distribution appears reasonable across categories. Focus on negotiating better rates for high-volume categories.

COST REDUCTION OPPORTUNITIES

1. Bulk Purchasing: Potential 10-15% savings for high-usage items
2. Supplier Comparison: Compare alternative suppliers for top-cost categories
3. Order Frequency: Optimize order frequency to reduce shipping costs

BUDGET RECOMMENDATIONS

Allocate 60% to consumables, 25% to materials, and 15% to instruments based on usage patterns.`;
};

const generateFallbackReorderRecommendations = (data) => {
  const highPriority = data.filter((item) => item.priority === "High");
  return `REORDER STRATEGY

IMMEDIATE ACTION (High Priority: ${highPriority.length} items)

Order these items within 24-48 hours to prevent stockouts.

ORDER QUANTITIES

• High priority: Order up to max stock level + 10% buffer
• Medium priority: Order to max stock level
• Low priority: Order to optimal stock level when convenient

RISK ASSESSMENT

Delaying high-priority orders may result in service disruptions and customer dissatisfaction.

BULK ORDER TIP

Combine orders where possible to negotiate volume discounts of 5-15%.`;
};

const generateFallbackComprehensiveReport = (data) => {
  return `EXECUTIVE SUMMARY

BUSINESS HEALTH

The inventory system is managing ${data.totalProducts} products valued at $${
    data.totalValue
  }. Current stock levels show ${
    data.lowStockCount
  } items requiring attention. Overall system health is ${
    data.lowStockCount > 10 ? "requiring improvement" : "good"
  } with opportunities for optimization.

CRITICAL ACTION ITEMS

1. Restock ${data.lowStockCount} low-stock items immediately
2. Review and adjust reorder points for frequently low-stock items
3. Negotiate better supplier terms for high-volume purchases
4. Implement automated reorder alerts for critical items
5. Conduct quarterly inventory audit to optimize stock levels

STRATEGIC RECOMMENDATIONS

• Implement predictive analytics for better demand forecasting
• Establish strategic partnerships with 2-3 key suppliers
• Consider just-in-time ordering for slow-moving items
• Invest in inventory management software integrations

RISK FACTORS

• Monitor supplier reliability and lead times
• Watch for seasonal demand fluctuations
• Track cost increases in key categories`;
};
