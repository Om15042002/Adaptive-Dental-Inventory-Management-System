import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Button,
} from '@mui/material';
import {
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    Assessment as ReportsIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    AdminPanelSettings as AdminIcon,
    Work as StaffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        adminCount: 0,
        staffCount: 0,
        totalProducts: 0,
        totalCategories: 0,
        lowStockItems: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        fetchAdminStats();
        fetchRecentUsers();
    }, []);

    const fetchAdminStats = async () => {
        try {
            // Fetch users count
            const usersResponse = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                const users = usersData.data || [];
                
                setStats(prev => ({
                    ...prev,
                    totalUsers: users.length,
                    adminCount: users.filter(u => u.role === 'admin').length,
                    staffCount: users.filter(u => u.role === 'staff').length
                }));
            }

            // You can add more API calls here for products, categories, etc.
            // For now, using mock data
            setStats(prev => ({
                ...prev,
                totalProducts: 150,
                totalCategories: 8,
                lowStockItems: 12
            }));

        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const users = data.data || [];
                // Get 5 most recent users
                const recent = users
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);
                setRecentUsers(recent);
            }
        } catch (error) {
            console.error('Error fetching recent users:', error);
        }
    };

    const adminCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: <PeopleIcon fontSize="large" />,
            color: '#2196f3',
            action: () => navigate('/users')
        },
        {
            title: 'Administrators',
            value: stats.adminCount,
            icon: <AdminIcon fontSize="large" />,
            color: '#9c27b0',
            action: () => navigate('/users')
        },
        {
            title: 'Staff Members',
            value: stats.staffCount,
            icon: <StaffIcon fontSize="large" />,
            color: '#4caf50',
            action: () => navigate('/users')
        },
        {
            title: 'Low Stock Items',
            value: stats.lowStockItems,
            icon: <WarningIcon fontSize="large" />,
            color: '#ff9800',
            action: () => navigate('/inventory')
        }
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Admin Dashboard
            </Typography>

            {/* Admin Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {adminCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                            onClick={card.action}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: card.color, 
                                            mr: 2, 
                                            width: 56, 
                                            height: 56 
                                        }}
                                    >
                                        {card.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.title}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Recent Users */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Recent Users
                            </Typography>
                            <Button size="small" onClick={() => navigate('/users')}>
                                View All
                            </Button>
                        </Box>
                        <List>
                            {recentUsers.map((user, index) => (
                                <ListItem key={user.id} divider={index < recentUsers.length - 1}>
                                    <ListItemIcon>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={user.username}
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={user.role.toUpperCase()}
                                                    size="small"
                                                    color={user.role === 'admin' ? 'primary' : 'secondary'}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {recentUsers.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No recent users
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<PeopleIcon />}
                                onClick={() => navigate('/users')}
                                fullWidth
                            >
                                Manage Users
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CategoryIcon />}
                                onClick={() => navigate('/categories')}
                                fullWidth
                            >
                                Manage Categories
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<InventoryIcon />}
                                onClick={() => navigate('/inventory')}
                                fullWidth
                            >
                                Check Inventory
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ReportsIcon />}
                                onClick={() => navigate('/reports')}
                                fullWidth
                            >
                                View Reports
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;