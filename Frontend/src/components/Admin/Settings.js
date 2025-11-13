import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Storage as StorageIcon,
    Backup as BackupIcon,
    Update as UpdateIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Settings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        lowStockAlerts: true,
        autoBackup: false,
        maintenanceMode: false,
        userRegistration: false,
    });

    const handleSettingChange = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
        toast.success('Setting updated successfully');
    };

    const handleBackup = () => {
        toast.info('Backup started... This may take a few minutes.');
        // Simulate backup process
        setTimeout(() => {
            toast.success('Backup completed successfully');
        }, 3000);
    };

    const settingsCategories = [
        {
            title: 'Notifications',
            icon: <NotificationsIcon />,
            settings: [
                {
                    key: 'emailNotifications',
                    label: 'Email Notifications',
                    description: 'Send email notifications for important events',
                    value: settings.emailNotifications
                },
                {
                    key: 'lowStockAlerts',
                    label: 'Low Stock Alerts',
                    description: 'Get notified when items are running low',
                    value: settings.lowStockAlerts
                }
            ]
        },
        {
            title: 'System',
            icon: <SettingsIcon />,
            settings: [
                {
                    key: 'autoBackup',
                    label: 'Automatic Backup',
                    description: 'Automatically backup data daily',
                    value: settings.autoBackup
                },
                {
                    key: 'maintenanceMode',
                    label: 'Maintenance Mode',
                    description: 'Restrict access for maintenance',
                    value: settings.maintenanceMode
                }
            ]
        },
        {
            title: 'Security',
            icon: <SecurityIcon />,
            settings: [
                {
                    key: 'userRegistration',
                    label: 'Public User Registration',
                    description: 'Allow new users to register without admin approval',
                    value: settings.userRegistration
                }
            ]
        }
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                System Settings
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                <Typography variant="body2">
                    These settings affect the entire system. Changes are applied immediately.
                </Typography>
            </Alert>

            <Grid container spacing={4}>
                {/* Settings Categories */}
                <Grid item xs={12} md={8}>
                    {settingsCategories.map((category, index) => (
                        <Paper key={index} sx={{ mb: 3, borderRadius: 2 }}>
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {category.icon}
                                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                                        {category.title}
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <List>
                                    {category.settings.map((setting, settingIndex) => (
                                        <ListItem key={settingIndex}>
                                            <ListItemText
                                                primary={setting.label}
                                                secondary={setting.description}
                                            />
                                            <ListItemSecondaryAction>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={setting.value}
                                                            onChange={() => handleSettingChange(setting.key)}
                                                            color="primary"
                                                        />
                                                    }
                                                    label=""
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Paper>
                    ))}
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            System Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<BackupIcon />}
                                onClick={handleBackup}
                                fullWidth
                            >
                                Create Backup
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<UpdateIcon />}
                                fullWidth
                            >
                                Check for Updates
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<StorageIcon />}
                                fullWidth
                            >
                                Database Maintenance
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            System Information
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText
                                    primary="Version"
                                    secondary="1.0.0"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Database"
                                    secondary="MySQL 8.0"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Last Backup"
                                    secondary="Today, 2:30 AM"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Uptime"
                                    secondary="7 days, 14 hours"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Settings;