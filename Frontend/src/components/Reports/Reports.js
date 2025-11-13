import React, { useState, useEffect } from "react";
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
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FileDownload as ExportIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ReorderIcon,
  Assessment as ReportIcon,
  Psychology as AIIcon,
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
  AreaChart,
  Area,
} from "recharts";
import { toast } from "react-toastify";
import {
  exportToExcel,
  exportMultipleSheets,
  formatReportsForExport,
} from "../../utils/excelExport";
import {
  generateInventoryInsights,
  generateUsageTrendsReport,
  generateCostAnalysisReport,
  generateReorderRecommendations,
  generateComprehensiveReport,
} from "../../services/aiService";

// Sample data for charts
const usageTrendsData = [
  { month: "Jan", consumables: 120, instruments: 45, materials: 80 },
  { month: "Feb", consumables: 135, instruments: 52, materials: 75 },
  { month: "Mar", consumables: 128, instruments: 48, materials: 88 },
  { month: "Apr", consumables: 142, instruments: 55, materials: 92 },
  { month: "May", consumables: 150, instruments: 58, materials: 85 },
  { month: "Jun", consumables: 165, instruments: 62, materials: 95 },
];

const costAnalysisData = [
  { category: "Consumables", cost: 12500, percentage: 35 },
  { category: "Materials", cost: 8900, percentage: 25 },
  { category: "Instruments", cost: 7200, percentage: 20 },
  { category: "Equipment", cost: 7100, percentage: 20 },
];

const reorderRecommendations = [
  {
    id: 1,
    productName: "Examination Gloves",
    currentStock: 5,
    recommendedOrder: 200,
    estimatedCost: 250,
    priority: "High",
    supplier: "SafeGuard Medical",
  },
  {
    id: 2,
    productName: "Dental Burs Set",
    currentStock: 8,
    recommendedOrder: 25,
    estimatedCost: 450,
    priority: "Medium",
    supplier: "PrecisionTools Ltd.",
  },
  {
    id: 3,
    productName: "Disposable Masks",
    currentStock: 15,
    recommendedOrder: 100,
    estimatedCost: 75,
    priority: "Low",
    supplier: "MedSupply Ltd.",
  },
];

const inventoryValueData = [
  { month: "Jan", value: 125000 },
  { month: "Feb", value: 128000 },
  { month: "Mar", value: 122000 },
  { month: "Apr", value: 135000 },
  { month: "May", value: 140000 },
  { month: "Jun", value: 145000 },
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiInsights, setAiInsights] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    // Data is static for demo purposes
  }, [dateRange, selectedCategory]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportReport = async (reportType) => {
    try {
      let dataToExport = [];
      let filename = "";

      switch (reportType) {
        case "comprehensive":
          // Export all report data in multiple sheets
          const sheets = [
            {
              data: formatReportsForExport(
                "usage-trends",
                usageTrendsData.map((item) => ({
                  product_name: item.month,
                  usage_count:
                    item.consumables + item.instruments + item.materials,
                  category: "All",
                }))
              ),
              sheetName: "Usage Trends",
            },
            {
              data: formatReportsForExport(
                "cost-analysis",
                costAnalysisData.map((item) => ({
                  product_name: item.category,
                  unit_cost: item.cost,
                  category_name: item.category,
                  total_value: item.cost,
                }))
              ),
              sheetName: "Cost Analysis",
            },
            {
              data: formatReportsForExport(
                "reorder-recommendations",
                reorderRecommendations
              ),
              sheetName: "Reorder Recommendations",
            },
            {
              data: formatReportsForExport(
                "inventory-value",
                inventoryValueData
              ),
              sheetName: "Inventory Value",
            },
          ];
          exportMultipleSheets(sheets, "Comprehensive_Report");
          toast.success("Comprehensive report exported successfully");
          return;

        case "usage-trends":
          dataToExport = formatReportsForExport(
            "usage-trends",
            usageTrendsData.map((item) => ({
              product_name: item.month,
              usage_count: item.consumables,
              category: "Consumables",
            }))
          );
          filename = "Usage_Trends_Report";
          break;

        case "cost-analysis":
          dataToExport = formatReportsForExport(
            "cost-analysis",
            costAnalysisData.map((item) => ({
              product_name: item.category,
              unit_cost: item.cost,
              category_name: item.category,
              total_value: item.cost,
            }))
          );
          filename = "Cost_Analysis_Report";
          break;

        case "reorder-recommendations":
          dataToExport = formatReportsForExport(
            "reorder-recommendations",
            reorderRecommendations
          );
          filename = "Reorder_Recommendations_Report";
          break;

        case "inventory-value":
          dataToExport = formatReportsForExport(
            "inventory-value",
            inventoryValueData
          );
          filename = "Inventory_Value_Report";
          break;

        default:
          dataToExport = [];
          filename = "Report";
      }

      if (dataToExport.length > 0) {
        const success = exportToExcel(dataToExport, filename, reportType);
        if (success) {
          toast.success(
            `${reportType.replace("-", " ")} report exported successfully`
          );
        } else {
          toast.error("Failed to export report");
        }
      } else {
        toast.warning("No data available to export");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const handleGenerateAIInsights = async (reportType) => {
    try {
      setGeneratingAI(true);
      setShowAIDialog(true);
      setAiInsights("Generating AI insights... Please wait.");

      let insights = "";

      switch (reportType) {
        case "comprehensive":
          const comprehensiveData = {
            totalProducts: 180,
            totalValue: 45000,
            lowStockCount: reorderRecommendations.filter(
              (r) => r.priority === "High"
            ).length,
            supplierCount: 12,
            usageTrend: "Increasing",
            costTrend: "Stable",
            stockMovement: "Active",
          };
          insights = await generateComprehensiveReport(comprehensiveData);
          break;

        case "usage-trends":
          insights = await generateUsageTrendsReport(usageTrendsData);
          break;

        case "cost-analysis":
          insights = await generateCostAnalysisReport(costAnalysisData);
          break;

        case "reorder-recommendations":
          const reorderData = reorderRecommendations.map((item) => ({
            productName: item.product,
            currentStock: item.currentStock,
            minStock: item.reorderPoint,
            priority: item.priority,
            daysUntilStockout: item.daysUntilStockout,
          }));
          insights = await generateReorderRecommendations(reorderData);
          break;

        case "inventory-value":
          const inventoryData = {
            totalProducts: 180,
            lowStockCount: 15,
            outOfStockCount: 3,
            totalValue: 45000,
            categories: ["Consumables", "Instruments", "Materials"],
            lowStockItems: reorderRecommendations.slice(0, 5).map((item) => ({
              name: item.product,
              currentStock: item.currentStock,
              minStock: item.reorderPoint,
            })),
          };
          insights = await generateInventoryInsights(inventoryData);
          break;

        default:
          insights =
            "Please select a specific report type to generate AI insights.";
      }

      setAiInsights(insights);
      toast.success("AI insights generated successfully");
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setAiInsights(
        "Failed to generate AI insights. Please try again later or check your API key configuration."
      );
      toast.error("Failed to generate AI insights");
    } finally {
      setGeneratingAI(false);
    }
  };

  const formatAIInsights = (text) => {
    // Split text into lines
    const lines = text.split("\n");

    return lines.map((line, index) => {
      // Check if line is a heading (all caps and no punctuation at end)
      const isHeading =
        line.trim().length > 0 &&
        line.trim() === line.trim().toUpperCase() &&
        !line.trim().match(/[.,:;!?]$/);

      // Check if line is a numbered item
      const isNumbered = line.trim().match(/^\d+\./);

      // Check if line is a bullet point
      const isBullet = line.trim().startsWith("•");

      if (isHeading) {
        return (
          <Typography
            key={index}
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#1976d2",
              mt: index === 0 ? 0 : 3,
              mb: 1,
            }}
          >
            {line}
          </Typography>
        );
      } else if (isNumbered) {
        return (
          <Typography
            key={index}
            variant="body1"
            sx={{
              ml: 2,
              mb: 1,
              fontWeight: 600,
            }}
          >
            {line}
          </Typography>
        );
      } else if (isBullet) {
        return (
          <Typography
            key={index}
            variant="body1"
            sx={{
              ml: 2,
              mb: 0.5,
            }}
          >
            {line}
          </Typography>
        );
      } else if (line.trim()) {
        return (
          <Typography
            key={index}
            variant="body1"
            sx={{
              mb: 1,
              lineHeight: 1.8,
            }}
          >
            {line}
          </Typography>
        );
      } else {
        return <Box key={index} sx={{ height: 8 }} />;
      }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}
          >
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights and data analysis
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={() => handleGenerateAIInsights("comprehensive")}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            AI Insights
          </Button>
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={() => handleExportReport("comprehensive")}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Export All
          </Button>
        </Box>
      </Box>

      {/* Date Range and Filters */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.startDate || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.endDate || ""}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  borderRadius: 1.5,
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="consumables">Consumables</MenuItem>
                <MenuItem value="materials">Materials</MenuItem>
                <MenuItem value="instruments">Instruments</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ReportIcon />}
              sx={{
                py: 1.75,
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Tabs */}
      <Paper
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{
            borderBottom: "1px solid #e0e0e0",
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&.Mui-selected": {
                color: "#1976d2",
              },
            },
          }}
        >
          <Tab label="Usage Trends" />
          <Tab label="Cost Analysis" />
          <Tab label="Reorder Recommendations" />
          <Tab label="Inventory Value" />
        </Tabs>

        {/* Usage Trends Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Monthly Usage Trends
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AIIcon />}
                    onClick={() => handleGenerateAIInsights("usage-trends")}
                  >
                    AI Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExportReport("usage-trends")}
                  >
                    Export
                  </Button>
                </Box>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="consumables"
                      stroke="#2196f3"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="instruments"
                      stroke="#4caf50"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="materials"
                      stroke="#ff9800"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Key Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Consumables usage increased by 37% over the last 6 months"
                    secondary="Consider bulk purchasing to reduce costs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Instrument usage is steady with seasonal variations"
                    secondary="Current stock levels are optimal"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Cost Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cost Distribution by Category
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AIIcon />}
                    onClick={() => handleGenerateAIInsights("cost-analysis")}
                  >
                    AI Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExportReport("cost-analysis")}
                  >
                    Export
                  </Button>
                </Box>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Cost",
                      ]}
                    />
                    <Bar dataKey="cost" fill="#2196f3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Cost Summary
              </Typography>
              <List>
                {costAnalysisData.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {item.category}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          ${item.cost.toLocaleString()} ({item.percentage}%)
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Card
                sx={{
                  mt: 3,
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#666", mb: 1 }}
                  >
                    Total Monthly Cost
                  </Typography>
                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    $
                    {costAnalysisData
                      .reduce((sum, item) => sum + item.cost, 0)
                      .toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Reorder Recommendations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Reorder Recommendations
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AIIcon />}
                onClick={() =>
                  handleGenerateAIInsights("reorder-recommendations")
                }
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                AI Analysis
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExportIcon />}
                onClick={() => handleExportReport("reorder-recommendations")}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
          <TableContainer sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Product Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Current Stock
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Recommended Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Estimated Cost
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Priority
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#333" }}>
                    Supplier
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "#333" }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reorderRecommendations.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f7fa",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.productName}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {item.recommendedOrder}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>
                      ${item.estimatedCost}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority}
                        size="small"
                        color={getPriorityColor(item.priority)}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ReorderIcon />}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Order Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Inventory Value Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Inventory Value Over Time
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AIIcon />}
                    onClick={() => handleGenerateAIInsights("inventory-value")}
                  >
                    AI Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExportIcon />}
                    onClick={() => handleExportReport("inventory-value")}
                  >
                    Export
                  </Button>
                </Box>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={inventoryValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Value",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2, color: "#666" }}
                  >
                    Current Inventory Value
                  </Typography>
                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    $145,000
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    +16% from last month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2, color: "#666" }}
                  >
                    Average Monthly Growth
                  </Typography>
                  <Typography
                    variant="h3"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    +3.2%
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, fontWeight: 500 }}
                  >
                    Steady inventory growth
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* AI Insights Dialog */}
      <Dialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AIIcon color="primary" />
          AI-Generated Insights
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {generatingAI ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Analyzing data and generating insights...
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="primary">
                  This may take a few moments
                </Typography>
              </Box>
            </Box>
          ) : (
            <Paper
              sx={{
                p: 3,
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                maxHeight: 500,
                overflow: "auto",
              }}
            >
              {formatAIInsights(aiInsights)}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setShowAIDialog(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(aiInsights);
              toast.success("Insights copied to clipboard");
            }}
            variant="contained"
            disabled={generatingAI}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Reports;
