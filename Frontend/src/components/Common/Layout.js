import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Assessment as ReportsIcon,
  ShoppingCart as ProductsIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  LocalShipping as SuppliersIcon,
  SwapHoriz as MovementsIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Products", icon: <ProductsIcon />, path: "/products" },
  { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
  { text: "Suppliers", icon: <SuppliersIcon />, path: "/suppliers" },
  { text: "Stock Movements", icon: <MovementsIcon />, path: "/stock-movements" },
  { text: "Reports", icon: <ReportsIcon />, path: "/reports" },
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // Safely parse user data with fallback
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { username: 'User', email: 'user@example.com' };
  };

  const user = getUserData();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: "100%", backgroundColor: "#ffffff" }}>
      <Toolbar
        sx={{
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          minHeight: 70,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            fontSize: "1.1rem",
          }}
        >
          🦷 Dental Inventory
        </Typography>
      </Toolbar>
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: "#e3f2fd",
                  borderLeft: "4px solid #1976d2",
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          color: "#333",
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: "#1976d2",
            }}
          >
            Adaptive Dental Inventory Management
          </Typography>
          <IconButton
            color="inherit"
            sx={{
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{
              ml: 1,
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight="600">
                {user.username || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email || ''}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f5f7fa",
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default Layout;
