import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import Menu from "@mui/icons-material/Menu";
import { Box, List, Button, Drawer, Collapse, ListItem, IconButton, useMediaQuery, ListItemButton, } from "@mui/material";
// CUSTOM DEFINED HOOK
import useLocation from "@/hooks/useLocation";
// CUSTOM COMPONENTS
import { Link } from "@/components/link";
import { Scrollbar } from "@/components/scrollbar";
import { FlexBetween, FlexBox } from "@/components/flexbox";
import MegaMenu from "@/layouts/main/menu/MegaMenu";
import MegaMenuList from "@/layouts/main/menu/MegaMenuList";
import { PAGES_MENUS } from "@/layouts/main/menu/navigation";
// CUSTOM ICON COMPONENT
import ChevronDown from "@/icons/ChevronDown";
// COMMON STYLES
const LIST_STYLE = {
    gap: 5,
    fontSize: 14,
    fontWeight: 500,
    listStyle: "none",
    alignItems: "center",
    a: { transition: "color 300ms", ":hover": { color: "primary.main" } },
};
const HeaderDark = () => {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const isMedium = useMediaQuery((theme) => theme.breakpoints.up("md"));
    const isActive = (path) => pathname === path;
    useEffect(() => {
        if (isMedium)
            setOpen(false);
    }, [isMedium]);
    // FOR LARGE SCREEN DEVICE
    const LARGE_DEVICE_CONTENT = (_jsxs(FlexBox, { component: "nav", sx: LIST_STYLE, children: [_jsx(Box, { component: Link, href: "/", color: isActive("/") ? "primary.main" : "white", children: "Home" }), _jsx(MegaMenu, { isDark: true }), _jsx(Box, { component: Link, href: "/components", color: isActive("/components") ? "primary.main" : "white", children: "Components" }), _jsx(Box, { component: Link, href: "https://essence-doc.vercel.app", color: "white", children: "Documentation" }), _jsx(Button, { children: "Buy Now" })] }));
    // FOR SMALL AND MEDIUM SCREEN DEVICE
    const SMALL_DEVICE_CONTENT = (_jsxs(Fragment, { children: [_jsx(Drawer, { anchor: "right", open: open, onClose: () => setOpen(false), children: _jsx(Scrollbar, { children: _jsxs(List, { disablePadding: true, sx: { minWidth: 260, height: "100%" }, children: [_jsx(ListItem, { sx: { mb: 1 }, children: _jsx("img", { src: "/static/logo/logo-svg.svg", alt: "logo", width: 40, height: 40 }) }), _jsx(ListItem, { disablePadding: true, children: _jsx(ListItemButton, { LinkComponent: Link, href: "#", children: "Home" }) }), _jsxs(ListItem, { disablePadding: true, sx: { flexDirection: "column", alignItems: "start" }, children: [_jsxs(ListItemButton, { onClick: () => setCollapsed(!collapsed), sx: { width: "100%", justifyContent: "space-between" }, children: ["Pages", " ", _jsx(ChevronDown, { sx: {
                                                    rotate: collapsed ? "180deg" : 0,
                                                    transition: "rotate 300ms",
                                                } })] }), _jsx(Collapse, { in: collapsed, children: _jsx(Box, { px: 2, py: 1.5, children: PAGES_MENUS.map(({ child, id, title }) => (_jsx(Box, { pl: 1, py: id === 2 ? 3 : 0, children: _jsx(MegaMenuList, { title: title, child: child }) }, id))) }) })] }), _jsx(ListItem, { disablePadding: true, children: _jsx(ListItemButton, { LinkComponent: Link, href: "/components", children: "Components" }) }), _jsx(ListItem, { disablePadding: true, children: _jsx(ListItemButton, { LinkComponent: "a", href: "https://essence-doc.vercel.app", children: "Documentation" }) }), _jsx(ListItem, { sx: { mt: 1 }, children: _jsx(Button, { fullWidth: true, children: "Buy Now" }) })] }) }) }), _jsx(IconButton, { color: "primary", onClick: () => setOpen(true), sx: { flexShrink: 0 }, children: _jsx(Menu, {}) })] }));
    return (_jsxs(FlexBetween, { component: "header", py: 2, children: [_jsx(Box, { display: "flex", component: Link, href: "/", alignItems: "center", gap: 0.5, children: _jsx("img", { src: "/static/logo/logo-svg.svg", alt: "Essence admin", width: 40, height: 40 }) }), isMedium ? LARGE_DEVICE_CONTENT : SMALL_DEVICE_CONTENT] }));
};
export default HeaderDark;
