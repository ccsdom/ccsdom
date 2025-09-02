import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, IconButton, useTheme, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { clientNavigations } from "./navigation-client";
const drawerWidth = 240;
const ClientLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawer = (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", fontWeight: "bold", mb: 2, children: "Mon espace" }), _jsx(List, { children: clientNavigations.map((item, index) => {
                    if (item.type === "label") {
                        return (_jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { mt: 2, mb: 1, pl: 1 }, children: item.label }, `label-${index}`));
                    }
                    if (item.type === "item") {
                        return (_jsxs(ListItemButton, { selected: location.pathname === item.path, onClick: () => {
                                if (item.path)
                                    navigate(item.path);
                            }, children: [_jsx(ListItemIcon, { children: item.icon ? _jsx(item.icon, {}) : null }), _jsx(ListItemText, { primary: item.name })] }, item.name || index));
                    }
                    return null;
                }) })] }));
    return (_jsxs(Box, { sx: { display: "flex", minHeight: "100vh" }, children: [_jsx(AppBar, { position: "fixed", sx: {
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: "none",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }, children: _jsxs(Toolbar, { children: [_jsx(IconButton, { color: "inherit", edge: "start", onClick: handleDrawerToggle, sx: { mr: 2, display: { md: "none" } }, "aria-label": "Ouvrir le menu", children: _jsx(MenuIcon, {}) }), _jsx(Typography, { variant: "h6", noWrap: true, children: "Tableau de bord client" })] }) }), _jsxs(Box, { component: "nav", sx: { width: { md: drawerWidth }, flexShrink: { md: 0 } }, "aria-label": "client sidebar", children: [_jsx(Drawer, { variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: { keepMounted: true }, sx: {
                            display: { xs: "block", md: "none" },
                            "& .MuiDrawer-paper": { width: drawerWidth },
                        }, children: drawer }), _jsx(Drawer, { variant: "permanent", sx: {
                            display: { xs: "none", md: "block" },
                            "& .MuiDrawer-paper": {
                                width: drawerWidth,
                                boxSizing: "border-box",
                                borderRight: "1px solid",
                                borderColor: "divider",
                            },
                        }, open: true, children: drawer })] }), _jsx(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    backgroundColor: theme.palette.background.default,
                }, children: _jsx(Outlet, {}) })] }));
};
export default ClientLayout;
