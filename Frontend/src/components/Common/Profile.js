import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    TextField,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    AdminPanelSettings as AdminIcon,
    Work as StaffIcon,
    AccessTime as TimeIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateUser, token } = useAuth();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    
    const [profileForm, setProfileForm] = useState({
        email: user?.email || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: profileForm.email })
            });

            if (response.ok) {
                const data = await response.json();
                updateUser(data.data);
                toast.success('Profile updated successfully');
                setOpenEditDialog(false);
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (response.ok) {
                toast.success('Password changed successfully');
                setOpenPasswordDialog(false);
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditDialog = () => {
        setProfileForm({ email: user.email });
        setOpenEditDialog(true);
    };

    const handleOpenPasswordDialog = () => {
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setOpenPasswordDialog(true);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                My Profile
            </Typography>

            <Grid container spacing={4}>
                {/* Profile Information */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        fontSize: '2rem',
                                        mr: 3
                                    }}
                                >
                                    {user?.username?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                        {user?.username}
                                    </Typography>
                                    <Chip
                                        label={user?.role?.toUpperCase()}
                                        color={user?.role === 'admin' ? 'primary' : 'secondary'}
                                        icon={user?.role === 'admin' ? <AdminIcon /> : <StaffIcon />}
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <PersonIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Username"
                                        secondary={user?.username}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmailIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email Address"
                                        secondary={user?.email}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <SecurityIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Account Role"
                                        secondary={`${user?.role === 'admin' ? 'Administrator' : 'Staff Member'} - ${user?.role === 'admin' ? 'Full system access' : 'Inventory management access'}`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <TimeIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Member Since"
                                        secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Account Settings
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={handleOpenEditDialog}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LockIcon />}
                                    onClick={handleOpenPasswordDialog}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Account Information
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Your account is active and in good standing.
                            </Alert>
                            <Typography variant="body2" color="text.secondary">
                                {user?.role === 'admin' 
                                    ? 'As an administrator, you have full access to all system features including user management, inventory control, and system settings.'
                                    : 'As a staff member, you have access to inventory management features. Contact an administrator for additional permissions.'
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Profile Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={user?.username}
                            disabled
                            sx={{ mb: 2 }}
                            helperText="Username cannot be changed"
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleUpdateProfile} 
                        variant="contained"
                        disabled={loading || profileForm.email === user?.email}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            sx={{ mb: 2 }}
                            required
                            helperText="Password must be at least 6 characters with uppercase, lowercase, and number"
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleChangePassword} 
                        variant="contained"
                        disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    >
                        {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;