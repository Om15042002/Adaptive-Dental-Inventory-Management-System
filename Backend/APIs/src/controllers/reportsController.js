const StockMovement = require('../models/StockMovement');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { formatResponse, handleError } = require('../utils/helpers');
const moment = require('moment');

class ReportsController {
    // Get usage analytics report
    async getUsageReport(req, res) {
        try {
            const days = parseInt(req.query.days) || 30;
            const analytics = await StockMovement.getUsageAnalytics(days);

            // Calculate additional insights
            const totalUsageValue = analytics.reduce((sum, item) => sum + parseFloat(item.usage_value), 0);
            const avgUsagePerDay = analytics.reduce((sum, item) => sum + parseFloat(item.total_used), 0) / days;

            res.json(formatResponse({
                period: {
                    days,
                    start_date: moment().subtract(days, 'days').format('YYYY-MM-DD'),
                    end_date: moment().format('YYYY-MM-DD')
                },
                summary: {
                    total_products_used: analytics.length,
                    total_usage_value: totalUsageValue,
                    formatted_total_usage_value: `$${totalUsageValue.toFixed(2)}`,
                    average_usage_per_day: avgUsagePerDay.toFixed(2)
                },
                usage_analytics: analytics,
                top_10_most_used: analytics.slice(0, 10),
                high_value_usage: analytics.filter(item => parseFloat(item.usage_value) > 100).slice(0, 10)
            }, 'Usage analytics report generated successfully'));

        } catch (error) {
            console.error('Get usage report error:', error);
            handleError(error, res);
        }
    }

    // Get cost analysis report
    async getCostReport(req, res) {
        try {
            const { date_from, date_to } = req.query;

            // Default to last 30 days if not provided
            const dateFrom = date_from || moment().subtract(30, 'days').format('YYYY-MM-DD');
            const dateTo = date_to || moment().format('YYYY-MM-DD');

            const analysis = await StockMovement.getCostAnalysis(dateFrom, dateTo);

            // Calculate totals and insights
            const totals = analysis.reduce((acc, item) => {
                acc.total_purchases += parseFloat(item.purchases);
                acc.total_usage_cost += parseFloat(item.usage_cost);
                acc.total_purchase_transactions += item.purchase_transactions;
                acc.total_usage_transactions += item.usage_transactions;
                return acc;
            }, {
                total_purchases: 0,
                total_usage_cost: 0,
                total_purchase_transactions: 0,
                total_usage_transactions: 0
            });

            const netCostImpact = totals.total_usage_cost - totals.total_purchases;

            res.json(formatResponse({
                period: {
                    date_from: dateFrom,
                    date_to: dateTo,
                    days: moment(dateTo).diff(moment(dateFrom), 'days') + 1
                },
                summary: {
                    ...totals,
                    formatted_purchases: `$${totals.total_purchases.toFixed(2)}`,
                    formatted_usage_cost: `$${totals.total_usage_cost.toFixed(2)}`,
                    net_cost_impact: netCostImpact,
                    formatted_net_cost_impact: `$${netCostImpact.toFixed(2)}`,
                    categories_analyzed: analysis.length
                },
                cost_analysis: analysis,
                highest_cost_categories: analysis.sort((a, b) => parseFloat(b.usage_cost) - parseFloat(a.usage_cost)).slice(0, 5),
                highest_purchase_categories: analysis.sort((a, b) => parseFloat(b.purchases) - parseFloat(a.purchases)).slice(0, 5)
            }, 'Cost analysis report generated successfully'));

        } catch (error) {
            console.error('Get cost report error:', error);
            handleError(error, res);
        }
    }

    // Get low stock summary report
    async getLowStockSummaryReport(req, res) {
        try {
            const [lowStockSummary, lowStockItems] = await Promise.all([
                Inventory.getLowStockSummary(),
                Inventory.findLowStock()
            ]);

            // Categorize by urgency
            const criticalItems = lowStockItems.filter(item => item.current_stock === 0);
            const lowItems = lowStockItems.filter(item => item.current_stock > 0 && item.current_stock <= item.min_stock * 0.5);
            const warningItems = lowStockItems.filter(item => item.current_stock > item.min_stock * 0.5 && item.current_stock <= item.min_stock);

            // Calculate potential reorder costs
            const reorderValue = lowStockItems.reduce((sum, item) => {
                const suggestedOrder = item.max_stock - item.current_stock;
                return sum + (suggestedOrder * item.unit_cost);
            }, 0);

            res.json(formatResponse({
                summary: {
                    total_low_stock_items: lowStockItems.length,
                    critical_items_count: criticalItems.length,
                    low_items_count: lowItems.length,
                    warning_items_count: warningItems.length,
                    categories_affected: lowStockSummary.length,
                    estimated_reorder_value: reorderValue,
                    formatted_reorder_value: `$${reorderValue.toFixed(2)}`
                },
                by_category: lowStockSummary,
                critical_items: criticalItems,
                low_stock_items: lowItems,
                warning_items: warningItems,
                reorder_suggestions: lowStockItems.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    current_stock: item.current_stock,
                    min_stock: item.min_stock,
                    max_stock: item.max_stock,
                    suggested_order_quantity: item.max_stock - item.current_stock,
                    estimated_cost: (item.max_stock - item.current_stock) * item.unit_cost,
                    urgency: item.current_stock === 0 ? 'Critical' : 
                            item.current_stock <= item.min_stock * 0.5 ? 'High' : 'Medium'
                }))
            }, 'Low stock summary report generated successfully'));

        } catch (error) {
            console.error('Get low stock summary report error:', error);
            handleError(error, res);
        }
    }

    // Get inventory value report
    async getInventoryValueReport(req, res) {
        try {
            const [
                totalValue,
                categories,
                suppliers,
                lowStockItems
            ] = await Promise.all([
                Inventory.getTotalStockValue(),
                Category.findAll(true),
                Supplier.findAll(true),
                Inventory.findLowStock()
            ]);

            // Calculate value by frequency
            const frequencies = ['Weekly', 'Monthly', 'Quarterly', 'One-Time'];
            const valueByFrequency = await Promise.all(
                frequencies.map(async (freq) => {
                    const products = await Product.findByFrequency(freq);
                    const value = products.reduce((sum, product) => 
                        sum + (product.current_stock || 0) * product.unit_cost, 0);
                    return {
                        frequency: freq,
                        product_count: products.length,
                        total_value: value,
                        formatted_value: `$${value.toFixed(2)}`
                    };
                })
            );

            // Calculate at-risk value (low stock items)
            const atRiskValue = lowStockItems.reduce((sum, item) => 
                sum + item.current_stock * item.unit_cost, 0);

            res.json(formatResponse({
                summary: {
                    total_inventory_value: totalValue,
                    formatted_total_value: `$${totalValue.toFixed(2)}`,
                    at_risk_value: atRiskValue,
                    formatted_at_risk_value: `$${atRiskValue.toFixed(2)}`,
                    at_risk_percentage: ((atRiskValue / totalValue) * 100).toFixed(2),
                    total_categories: categories.length,
                    total_suppliers: suppliers.length
                },
                value_by_category: categories.map(cat => ({
                    category_id: cat.id,
                    category_name: cat.name,
                    product_count: cat.product_count || 0,
                    total_value: cat.total_inventory_value || 0,
                    formatted_value: `$${(cat.total_inventory_value || 0).toFixed(2)}`,
                    percentage_of_total: ((cat.total_inventory_value || 0) / totalValue * 100).toFixed(2)
                })),
                value_by_supplier: suppliers.map(sup => ({
                    supplier_id: sup.id,
                    supplier_name: sup.name,
                    product_count: sup.product_count || 0,
                    total_value: sup.total_inventory_value || 0,
                    formatted_value: `$${(sup.total_inventory_value || 0).toFixed(2)}`,
                    percentage_of_total: ((sup.total_inventory_value || 0) / totalValue * 100).toFixed(2)
                })),
                value_by_frequency: valueByFrequency,
                top_value_categories: categories
                    .filter(cat => cat.total_inventory_value > 0)
                    .sort((a, b) => (b.total_inventory_value || 0) - (a.total_inventory_value || 0))
                    .slice(0, 5),
                top_value_suppliers: suppliers
                    .filter(sup => sup.total_inventory_value > 0)
                    .sort((a, b) => (b.total_inventory_value || 0) - (a.total_inventory_value || 0))
                    .slice(0, 5)
            }, 'Inventory value report generated successfully'));

        } catch (error) {
            console.error('Get inventory value report error:', error);
            handleError(error, res);
        }
    }

    // Get comprehensive dashboard report
    async getDashboardReport(req, res) {
        try {
            const [
                totalValue,
                lowStockItems,
                recentMovements,
                usageAnalytics
            ] = await Promise.all([
                Inventory.getTotalStockValue(),
                Inventory.findLowStock(),
                StockMovement.getRecent(10),
                StockMovement.getUsageAnalytics(7) // Last 7 days
            ]);

            // Quick stats
            const criticalItems = lowStockItems.filter(item => item.current_stock === 0);
            const weeklyUsageValue = usageAnalytics.reduce((sum, item) => 
                sum + parseFloat(item.usage_value), 0);

            res.json(formatResponse({
                overview: {
                    total_inventory_value: totalValue,
                    formatted_total_value: `$${totalValue.toFixed(2)}`,
                    low_stock_alerts: lowStockItems.length,
                    critical_alerts: criticalItems.length,
                    weekly_usage_value: weeklyUsageValue,
                    formatted_weekly_usage: `$${weeklyUsageValue.toFixed(2)}`,
                    recent_activity_count: recentMovements.length
                },
                alerts: {
                    critical_items: criticalItems.slice(0, 5),
                    low_stock_items: lowStockItems.filter(item => item.current_stock > 0).slice(0, 5)
                },
                recent_activity: recentMovements,
                top_weekly_usage: usageAnalytics.slice(0, 5),
                quick_actions: [
                    {
                        action: 'reorder_critical',
                        title: 'Reorder Critical Items',
                        count: criticalItems.length,
                        priority: 'high'
                    },
                    {
                        action: 'review_low_stock',
                        title: 'Review Low Stock',
                        count: lowStockItems.length,
                        priority: 'medium'
                    },
                    {
                        action: 'update_inventory',
                        title: 'Update Inventory',
                        count: 0,
                        priority: 'low'
                    }
                ]
            }, 'Dashboard report generated successfully'));

        } catch (error) {
            console.error('Get dashboard report error:', error);
            handleError(error, res);
        }
    }

    // Generate custom report
    async getCustomReport(req, res) {
        try {
            const {
                report_type,
                date_from,
                date_to,
                category_ids,
                supplier_ids,
                include_details
            } = req.query;

            if (!report_type) {
                return res.status(400).json(formatResponse(null, 'Report type is required', 400));
            }

            let reportData = {};

            switch (report_type) {
                case 'stock_movements':
                    const filters = {
                        date_from,
                        date_to,
                        category_id: category_ids,
                        limit: include_details === 'true' ? 1000 : 100
                    };
                    reportData = {
                        movements: await StockMovement.findAll(filters),
                        stats: await StockMovement.getMovementStats(date_from || moment().subtract(30, 'days').format('YYYY-MM-DD'), date_to || moment().format('YYYY-MM-DD'))
                    };
                    break;

                case 'inventory_status':
                    reportData = {
                        inventory: await Inventory.findAll({ category_id: category_ids, supplier_id: supplier_ids }),
                        low_stock_summary: await Inventory.getLowStockSummary()
                    };
                    break;

                case 'cost_analysis':
                    reportData = await StockMovement.getCostAnalysis(
                        date_from || moment().subtract(30, 'days').format('YYYY-MM-DD'),
                        date_to || moment().format('YYYY-MM-DD')
                    );
                    break;

                default:
                    return res.status(400).json(formatResponse(null, 'Invalid report type', 400));
            }

            res.json(formatResponse({
                report_type,
                generated_at: moment().toISOString(),
                parameters: {
                    date_from,
                    date_to,
                    category_ids,
                    supplier_ids,
                    include_details
                },
                data: reportData
            }, 'Custom report generated successfully'));

        } catch (error) {
            console.error('Get custom report error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new ReportsController();