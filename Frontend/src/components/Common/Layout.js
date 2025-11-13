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
  Chip,
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
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Business as SuppliersIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

// Menu items will be dynamically generated based on user role

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Dynamic menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      { text: "Products", icon: <ProductsIcon />, path: "/products" },
      { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
      { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
      { text: "Suppliers", icon: <SuppliersIcon />, path: "/suppliers" },
      { text: "Reports", icon: <ReportsIcon />, path: "/reports" },
    ];

    // Add admin-only items
    if (isAdmin()) {
      baseItems.push({
        text: "User Management",
        icon: <PeopleIcon />,
        path: "/users",
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        sx={{
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          minHeight: 70,
          display: "flex",
          alignItems: "center",
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          🦷 Dental Inventory
        </Typography>
      </Toolbar>
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
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
                transition: "all 0.2s ease-in-out",
                "&.Mui-selected": {
                  backgroundColor: "#e3f2fd",
                  borderLeft: "4px solid #1976d2",
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : "#546e7a",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: "block", textAlign: "center" }}
        >
          v1.0.0 • © 2025
        </Typography>
      </Box>
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
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: "none" },
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                transform: "scale(1.1)",
              },
            }}
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
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: "none", sm: "block" },
            }}
          >
            Adaptive Dental Inventory Management
          </Typography>

          <IconButton
            color="inherit"
            sx={{
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                transform: "scale(1.1)",
              },
            }}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", ml: 2, gap: 1 }}>
            <Chip
              label={user?.role?.toUpperCase()}
              color={isAdmin() ? "primary" : "secondary"}
              size="small"
              sx={{
                fontWeight: 600,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="textSecondary">
                Signed in as
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.5 }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
                navigate("/profile");
              }}
              sx={{
                py: 1.5,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  transform: "translateX(4px)",
                },
              }}
            >
              <PersonIcon sx={{ mr: 1.5, color: "primary.main" }} />
              Profile
            </MenuItem>
            {isAdmin() && (
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate("/register");
                }}
                sx={{
                  py: 1.5,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <PersonAddIcon sx={{ mr: 1.5, color: "info.main" }} />
                Register New User
              </MenuItem>
            )}
            {isAdmin() && (
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate("/settings");
                }}
                sx={{
                  py: 1.5,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <SettingsIcon sx={{ mr: 1.5, color: "secondary.main" }} />
                Settings
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: "error.main",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#ffebee",
                  transform: "translateX(4px)",
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1.5 }} />
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
