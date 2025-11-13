import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Avatar,
    Pagination,
    Stack,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Work as StaffIcon,
    Block as BlockIcon,
    CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'staff'
    });
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const { user: currentUser, token } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                username: user.username,
                email: user.email,
                password: '', // Don't populate password for editing
                role: user.role
            });
        } else {
            setEditingUser(null);
            setUserForm({
                username: '',
                email: '',
                password: '',
                role: 'staff'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setUserForm({
            username: '',
            email: '',
            password: '',
            role: 'staff'
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const url = editingUser 
                ? `http://localhost:3000/api/users/${editingUser.id}`
                : 'http://localhost:3000/api/auth/register';
            
            const method = editingUser ? 'PUT' : 'POST';
            
            const body = editingUser 
                ? { email: userForm.email, role: userForm.role }
                : userForm;

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
                handleCloseDialog();
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Error saving user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser.id) {
            toast.error('You cannot delete your own account');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    toast.success('User deleted successfully');
                    fetchUsers();
                } else {
                    const data = await response.json();
                    toast.error(data.message || 'Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Error deleting user');
            }
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const getUserStats = () => {
        const totalUsers = users.length;
        const adminCount = users.filter(u => u.role === 'admin').length;
        const staffCount = users.filter(u => u.role === 'staff').length;
        return { totalUsers, adminCount, staffCount };
    };

    const stats = getUserStats();

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                User Management
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                                    <PersonIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {stats.totalUsers}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Users
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
                                    <AdminIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {stats.adminCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Administrators
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 56, height: 56 }}>
                                    <StaffIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {stats.staffCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Staff Members
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Add User Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New User
                </Button>
            </Box>

            {/* Users Table */}
            <Paper sx={{ borderRadius: 2, boxShadow: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                                {user.username}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role.toUpperCase()}
                                            color={user.role === 'admin' ? 'primary' : 'secondary'}
                                            size="small"
                                            icon={user.role === 'admin' ? <AdminIcon /> : <StaffIcon />}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit User">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(user)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {user.id !== currentUser.id && (
                                            <Tooltip title="Delete User">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {users.length > itemsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Paper>

            {/* User Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={userForm.username}
                            onChange={handleFormChange}
                            disabled={editingUser} // Can't change username when editing
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={userForm.email}
                            onChange={handleFormChange}
                            sx={{ mb: 2 }}
                            required
                        />
                        {!editingUser && (
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={userForm.password}
                                onChange={handleFormChange}
                                sx={{ mb: 2 }}
                                required
                                helperText="Password must be at least 6 characters with uppercase, lowercase, and number"
                            />
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={userForm.role}
                                onChange={handleFormChange}
                                label="Role"
                            >
                                <MenuItem value="staff">Staff</MenuItem>
                                <MenuItem value="admin">Administrator</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;